from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from crew import ResumeEvaluationCrew
from config.settings import settings

app = FastAPI(
    title="Resume Analyzer API",
    description="API for analyzing resumes against job descriptions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Ensure required directories exist
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile,
    job_description: UploadFile,
    additional_info: str = Form("")
):
    try:
        if not resume.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Resume must be a PDF file")
        if not job_description.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Job description must be a PDF file")

        # Save uploaded files
        resume_path = os.path.join(TEMP_DIR, resume.filename)
        jd_path = os.path.join(TEMP_DIR, job_description.filename)

        try:
            with open(resume_path, "wb") as f:
                f.write(await resume.read())
            with open(jd_path, "wb") as f:
                f.write(await job_description.read())

            # Run the crew
            crew = ResumeEvaluationCrew(
                jd_path=jd_path,
                resume_paths=resume_path,
                user_input_text=additional_info
            )

            crew.crew().kickoff()

            # Read the final judgment
            try:
                with open(os.path.join(OUTPUT_DIR, 'final_judgement.json'), 'r') as f:
                    content = f.read().strip()
                    # Remove the JSON code block markers if they exist
                    content = content.replace('```json', '').replace('```', '').strip()
                    result = json.loads(content)

                    # Ensure the required keys exist
                    if not all(key in result for key in ["Evaluating Score", "Evaluating Statement", "Suggestions"]):
                        raise HTTPException(
                            status_code=500,
                            detail="Invalid response format from analysis"
                        )

                    return result
            except json.JSONDecodeError as e:
                print("JSON Error:", e)
                print("Content:", content)
                raise HTTPException(
                    status_code=500,
                    detail="Error parsing analysis results"
                )

        except Exception as e:
            print("Error during analysis:", str(e))
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            # Clean up temporary files
            if os.path.exists(resume_path):
                os.remove(resume_path)
            if os.path.exists(jd_path):
                os.remove(jd_path)

    except Exception as e:
        print("Outer error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.env == "development"
    )
