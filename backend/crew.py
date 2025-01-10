from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import PDFSearchTool
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

openai = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

gemini = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY")
)

@CrewBase
class ResumeEvaluationCrew:
    """Resume Evaluation Crew"""
    def __init__(self, jd_path: str, resume_paths: str, user_input_text: str, progress_callback=None):
        self.jd_path = jd_path
        self.resume_path = resume_paths
        self.user_input_text = user_input_text
        self.progress_callback = progress_callback

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def job_description_extractor_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['job_description_extractor'],
            tools=[PDFSearchTool(pdf=self.jd_path)],
            llm=openai,
            verbose=False
        )

    @agent
    def job_description_analyst_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['job_description_analyzer'],
            llm=openai,
            verbose=False
        )

    @agent
    def resume_extractor_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['resume_extractor'],
            tools=[PDFSearchTool(pdf=self.resume_path)],
            llm=openai,
            verbose=False
        )

    @agent
    def user_input_analyzer_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['user_input_analyzer'],
            llm=openai,
            verbose=False
        )

    @agent
    def resume_analyst_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['resume_user_input_analyzer'],
            llm=openai,
            verbose=False
        )

    @agent
    def evaluator_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['evaluator'],
            llm=gemini,
            verbose=False
        )

    @agent
    def advisor_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['advisor'],
            llm=gemini,
            verbose=False
        )

    @agent
    def user_interface_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['user_interface_agent'],
            llm=gemini,
            verbose=False
        )

    @agent
    def resume_generator_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['resume_generator_agent'],
            llm=openai,
            verbose=True
        )

    @task
    def job_description_extraction_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Extracting data from Job Description', 1)
        return Task(
            config=self.tasks_config['job_description_extraction_task'],
            agent=self.job_description_extractor_agent(),
            async_execution=True
        )

    @task
    def job_description_analysis_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Analyzing Job Description', 2)
        return Task(
            config=self.tasks_config['job_description_analysis_task'],
            context=[self.job_description_extraction_task()],
            output_file='output/job_description_analysis.json',
            agent=self.job_description_analyst_agent(),
            async_execution=False
        )

    @task
    def resume_extraction_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Extracting data from Resume', 3)
        return Task(
            config=self.tasks_config['resume_extraction_task'],
            agent=self.resume_extractor_agent(),
            async_execution=True
        )

    @task
    def user_input_analyzer_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Analyzing user input', 4)
        return Task(
            config=self.tasks_config['analyze_user_input'],
            agent=self.user_input_analyzer_agent(),
            async_execution=False
        )

    @task
    def resume_analysis_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Analyzing Resume', 5)
        return Task(
            config=self.tasks_config['resume_user_input_analysis_task'],
            context=[self.resume_extraction_task(), self.user_input_analyzer_task()],
            output_file='output/resume_analysis.json',
            agent=self.resume_analyst_agent(),
            async_execution=False
        )

    @task
    def evaluation_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Evaluating Resume against Job Description', 6)
        return Task(
            config=self.tasks_config['evaluation_task'],
            context=[self.job_description_analysis_task(),self.resume_analysis_task()],
            output_file='output/evaluation.md',
            agent=self.evaluator_agent()
        )

    @task
    def advisor_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Generating suggestions for improvements', 7)
        return Task(
            config=self.tasks_config['advisor_task'],
            context=[self.job_description_analysis_task(),self.resume_analysis_task(),self.evaluation_task()],
            output_file='output/advice.md',
            agent=self.advisor_agent()
        )

    @task
    def user_interface_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Preparing final results', 8)
        return Task(
            config=self.tasks_config['user_interface_task'],
            context=[self.evaluation_task(),self.advisor_task()],
            output_file='output/final_judgement.json',
            agent=self.user_interface_agent()
        )

    @task
    def resume_generation_task(self) -> Task:
        if self.progress_callback:
            self.progress_callback('Generating improved resume', 9)
        return Task(
            config=self.tasks_config['resume_generation_task'],
            context=[
                self.resume_analysis_task(),
                self.evaluation_task(),
                self.advisor_task()
            ],
            output_file='output/improved_resume.md',
            agent=self.resume_generator_agent()
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Resume Evaluation Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            verbose=True,
        )
