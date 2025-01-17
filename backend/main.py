from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import os
import uvicorn
from crew import ResumeEvaluationCrew
from dotenv import load_dotenv
from spire.doc import Document, FileFormat
from pathlib import Path

# Load environment variables
load_dotenv()

# Environment settings
ENV = os.getenv("ENV", "development")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))

# Directory settings
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Ensure required directories exist
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# CORS settings
FRONTEND_URL_DEV = os.getenv("FRONTEND_URL_DEV")
FRONTEND_URL_PROD = os.getenv("FRONTEND_URL_PROD")
CORS_ORIGINS = []

if FRONTEND_URL_DEV:
    CORS_ORIGINS.append(FRONTEND_URL_DEV)
if FRONTEND_URL_PROD:
    CORS_ORIGINS.append(FRONTEND_URL_PROD)

if not CORS_ORIGINS:
    raise ValueError("No CORS origins configured. Set FRONTEND_URL_DEV and/or FRONTEND_URL_PROD environment variables.")

app = FastAPI(
    title="Resume Analyzer API",
    description="API for analyzing resumes against job descriptions",
    version="1.0.0"
)

# Mount the output directory to serve static files (like PDFs)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")

# Configure CORS with more permissive settings for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL_DEV, FRONTEND_URL_PROD],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def convert_markdown_to_docx(markdown_file, output_filename):
    """Convert markdown file to docx and save to outputs/doc"""
    try:
        # Setup output directory
        doc_dir = Path('output/doc')
        doc_dir.mkdir(exist_ok=True)
        output_path = doc_dir / output_filename

        # Read and clean markdown content
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if content.startswith('```markdown\n'):
                content = content[len('```markdown\n'):]
            if content.endswith('\n```'):
                content = content[:-4]

        # Write cleaned content to temporary file
        temp_md = Path('output/temp.md')
        with open(temp_md, 'w', encoding='utf-8') as f:
            f.write(content)

        doc = Document()
        doc.LoadFromFile(str(temp_md))
        doc.SaveToFile(str(output_path), FileFormat.Docx2016)
        doc.Dispose()

        # Clean up temp file
        temp_md.unlink()

        print(f"✓ Saved to: {output_path}")

        return True

    except Exception as e:
        print(f"Error converting {markdown_file}: {str(e)}")
        return None

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

            # Ensure output directory exists
            os.makedirs('output', exist_ok=True)

            # Run the crew
            crew = ResumeEvaluationCrew(
                jd_path=jd_path,
                resume_paths=resume_path,
                user_input_text=additional_info
            )

            crew.crew().kickoff()

            # Check if markdown file exists
            markdown_path = 'output/improved_resume.md'
            if not os.path.exists(markdown_path):
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate improved resume"
                )

            # Read and clean the markdown content with explicit UTF-8 encoding
            try:
                with open(markdown_path, 'r', encoding='utf-8') as f:
                    markdown_content = f.read().strip()
            except UnicodeDecodeError:
                # Fallback to read with different encoding if UTF-8 fails
                with open(markdown_path, 'r', encoding='latin-1') as f:
                    markdown_content = f.read().strip()

            # Remove markdown code block markers if they exist
            markdown_content = markdown_content.replace('```markdown\n', '').replace('\n```', '')
            markdown_content = markdown_content.strip()

            if not markdown_content:
                raise HTTPException(
                    status_code=500,
                    detail="Generated resume is empty"
                )

            # Save the cleaned markdown content back to the file with UTF-8 encoding
            with open(markdown_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)

            # Generate PDF from cleaned markdown
            doc_generated = convert_markdown_to_docx(markdown_path, 'improved_resume.docx')

            # Read the final judgment with UTF-8 encoding
            try:
                with open('output/final_judgement.json', 'r', encoding='utf-8') as f:
                    content = f.read().strip()
            except UnicodeDecodeError:
                # Fallback to read with different encoding if UTF-8 fails
                with open('output/final_judgement.json', 'r', encoding='latin-1') as f:
                    content = f.read().strip()

            content = content.replace('```json', '').replace('```', '').strip()
            result = json.loads(content)

            if doc_generated:
                result["resume_path"] = "output/doc/improved_resume.docx"

            return result

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": ENV}

if __name__ == "__main__":
    print("Starting Resume Analyzer API...")
    print(f"Environment: {ENV}")
    print(f"Server running at http://{HOST}:{PORT}")

    if ENV == "development":
        os.system(f"uvicorn main:app --host {HOST} --port {PORT} --reload")
    else:
        uvicorn.run(app, host=HOST, port=PORT)
