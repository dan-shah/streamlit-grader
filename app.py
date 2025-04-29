import streamlit as st
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from pydantic import BaseModel, Field
import PyPDF2
import os
from pathlib import Path
import tempfile
import base64
import json
import re

# Set page config
st.set_page_config(
    page_title="AI Assignment Grader",
    page_icon="📚",
    layout="wide"
)

# Initialize session state
if 'api_key' not in st.session_state:
    st.session_state.api_key = None
if 'rubric_feedback' not in st.session_state:
    st.session_state.rubric_feedback = None

# Define Pydantic models for structured output
class ImprovementSuggestion(BaseModel):
    area: str = Field(description="Area of improvement")
    suggestion: str = Field(description="Specific suggestion for improvement")

class GradingFeedback(BaseModel):
    numerical_grade: int = Field(description="Numerical grade from 0-100", ge=0, le=100)
    overall_assessment: str = Field(description="Overall assessment of the submission")
    strengths: list[str] = Field(description="List of strengths in the submission")
    weaknesses: list[str] = Field(description="List of weaknesses in the submission")
    improvement_suggestions: list[ImprovementSuggestion] = Field(description="Suggestions for improvement")

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        st.error(f"Error extracting text from PDF: {str(e)}")
        return None
    return text

def analyze_rubric(assignment_rubric_text, api_key):
    """Analyze the rubric/assignment to provide feedback for better grading."""
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model with Gemini 2.0 Flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt
        prompt = f"""
        You are an expert educator reviewing a grading rubric and assignment. 
        Please analyze the following assignment and rubric to provide insights on:
        
        1. The key areas that should be assessed
        2. Important details that graders should look for
        3. Common pitfalls or misconceptions students might have
        4. Advice for grading consistently and fairly
        
        Assignment and Rubric:
        {assignment_rubric_text}
        
        Provide a detailed analysis that would help someone grade this assignment effectively.
        """
        
        # Generate response
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        st.error(f"Error analyzing rubric: {str(e)}")
        return None

def grade_assignment(assignment_text, solution_text, submission_text, api_key):
    """Grade the assignment using Gemini with structured output."""
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model with Gemini 2.0 Flash
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        # Create the prompt with structured output instructions
        prompt = f"""
        You are an expert teacher grading an assignment. Please grade the following student submission 
        based on the assignment requirements and provided solution.
        
        Assignment Requirements (including rubric):
        {assignment_text}
        
        Solution:
        {solution_text}
        
        Student Submission:
        {submission_text}
        
        Please provide a detailed evaluation of the student's work, highlighting strengths, weaknesses,
        and areas for improvement. Be specific and constructive.
        
        Your response should be provided as structured JSON following this schema:
        
        class ImprovementSuggestion:
            area: str  # Area of improvement
            suggestion: str  # Specific suggestion for improvement
        
        class GradingFeedback:
            numerical_grade: int  # Numerical grade from 0-100
            overall_assessment: str  # Overall assessment of the submission
            strengths: list[str]  # List of strengths in the submission
            weaknesses: list[str]  # List of weaknesses in the submission
            improvement_suggestions: list[ImprovementSuggestion]  # Suggestions for improvement
        
        Please respond with ONLY a valid JSON object following this schema.
        """
        
        # Generate structured response
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Extract the JSON part from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', text_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON without code blocks
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # If no JSON found, return the raw text
                return {"raw_response": text_response}
        
        try:
            # Parse the JSON
            data = json.loads(json_str)
            # Validate with Pydantic
            grading_feedback = GradingFeedback(**data)
            return grading_feedback
        except Exception as e:
            st.error(f"Error parsing structured response: {str(e)}")
            return {"raw_response": text_response}
            
    except Exception as e:
        st.error(f"Error grading assignment: {str(e)}")
        return None

def load_sample_files():
    """Load sample files from the data directory."""
    data_dir = Path("data")
    try:
        assignment_file = data_dir / "arima_hw5_assignment_and_rubric.pdf"
        solution_file = data_dir / "arima_hw5_solution_perfect.pdf"
        submission_file = data_dir / "arima_hw5_student_Cplus.pdf"
        
        return {
            "assignment": assignment_file,
            "solution": solution_file,
            "submission": submission_file
        }
    except Exception as e:
        st.error(f"Error loading sample files: {str(e)}")
        return None

def get_file_download_link(file_path, link_text):
    """Generate a download link for a file."""
    with open(file_path, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode()
    href = f'<a href="data:application/pdf;base64,{b64}" download="{file_path.name}">{link_text}</a>'
    return href

def display_grading_results(results):
    """Display grading results in a structured format."""
    if isinstance(results, GradingFeedback):
        # Display structured results
        st.subheader(f"Grade: {results.numerical_grade}/100")
        
        st.markdown("### Overall Assessment")
        st.write(results.overall_assessment)
        
        st.markdown("### Strengths")
        for i, strength in enumerate(results.strengths, 1):
            st.markdown(f"**{i}.** {strength}")
        
        st.markdown("### Areas for Improvement")
        for i, weakness in enumerate(results.weaknesses, 1):
            st.markdown(f"**{i}.** {weakness}")
        
        st.markdown("### Specific Suggestions")
        for i, suggestion in enumerate(results.improvement_suggestions, 1):
            st.markdown(f"**{i}. {suggestion.area}**")
            st.markdown(f"   {suggestion.suggestion}")
    elif isinstance(results, dict) and "raw_response" in results:
        # Display raw response if structured parsing failed
        st.markdown("### Grading Results")
        st.markdown(results["raw_response"])
    else:
        # Fallback for any other format
        st.markdown("### Grading Results")
        st.write(results)

# Main app
st.title("📚 AI Assignment Grader")
st.markdown("""
This application uses Google's Generative AI to automatically grade assignments by comparing student submissions 
against assignment requirements and solution PDFs.
""")

# API Key input
api_key = st.text_input("Enter your Google API Key:", type="password", value=st.session_state.api_key)
if api_key:
    st.session_state.api_key = api_key

# Sample files section
st.header("Sample Files")
st.markdown("""
You can view and download the sample files used for testing the application:
""")

sample_files = load_sample_files()
if sample_files:
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("Assignment & Rubric")
        st.markdown(get_file_download_link(sample_files["assignment"], "Download Assignment PDF"), unsafe_allow_html=True)
    
    with col2:
        st.subheader("Solution")
        st.markdown(get_file_download_link(sample_files["solution"], "Download Solution PDF"), unsafe_allow_html=True)
    
    with col3:
        st.subheader("Student Submission")
        st.markdown(get_file_download_link(sample_files["submission"], "Download Submission PDF"), unsafe_allow_html=True)

# File upload section
st.header("Upload Files")
use_sample_files = st.checkbox("Use sample files for testing")

if use_sample_files:
    if sample_files:
        st.success("Sample files loaded successfully!")
        assignment_file = sample_files["assignment"]
        solution_file = sample_files["solution"]
        submission_file = sample_files["submission"]
    else:
        st.error("Failed to load sample files. Please upload your own files.")
        use_sample_files = False

if not use_sample_files:
    assignment_file = st.file_uploader("Upload Assignment PDF (includes rubric)", type="pdf")
    solution_file = st.file_uploader("Upload Solution PDF", type="pdf")
    submission_file = st.file_uploader("Upload Student Submission PDF", type="pdf")

# Add option to analyze rubric
if assignment_file and st.button("Analyze Rubric/Assignment"):
    if not st.session_state.api_key:
        st.error("Please enter your Google API Key first!")
    else:
        with st.spinner("Analyzing rubric and assignment..."):
            assignment_text = extract_text_from_pdf(assignment_file)
            if assignment_text:
                rubric_feedback = analyze_rubric(assignment_text, st.session_state.api_key)
                if rubric_feedback:
                    st.session_state.rubric_feedback = rubric_feedback
                    st.success("Rubric analysis completed!")
                    st.markdown("### Rubric Analysis")
                    st.markdown(rubric_feedback)
            else:
                st.error("Failed to extract text from the assignment file.")

# Grade button
if st.button("Grade Assignment"):
    if not st.session_state.api_key:
        st.error("Please enter your Google API Key first!")
    elif not use_sample_files and (not assignment_file or not solution_file or not submission_file):
        st.error("Please upload all required PDF files!")
    else:
        with st.spinner("Grading assignment..."):
            # Extract text from PDFs
            assignment_text = extract_text_from_pdf(assignment_file)
            solution_text = extract_text_from_pdf(solution_file)
            submission_text = extract_text_from_pdf(submission_file)
            
            if all([assignment_text, solution_text, submission_text]):
                # Grade the assignment
                result = grade_assignment(
                    assignment_text,
                    solution_text,
                    submission_text,
                    st.session_state.api_key
                )
                
                if result:
                    st.success("Grading completed!")
                    display_grading_results(result)
            else:
                st.error("Failed to extract text from one or more PDF files. Please ensure they are text-based PDFs.")

# Show rubric feedback if it exists
if st.session_state.rubric_feedback and not st.button("Clear Rubric Analysis"):
    st.markdown("### Previous Rubric Analysis")
    st.markdown(st.session_state.rubric_feedback)
else:
    st.session_state.rubric_feedback = None

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p>Built with ❤️ using Streamlit and Google's Generative AI</p>
    <p>For more information, visit the <a href='https://github.com/dan-shah/streamlit-grader'>GitHub repository</a></p>
</div>
""", unsafe_allow_html=True) 