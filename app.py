import streamlit as st
import google.generativeai as genai
import PyPDF2
import os
from pathlib import Path
import tempfile
import base64

# Set page config
st.set_page_config(
    page_title="AI Assignment Grader",
    page_icon="📚",
    layout="wide"
)

# Initialize session state
if 'api_key' not in st.session_state:
    st.session_state.api_key = None

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

def grade_assignment(assignment_text, solution_text, submission_text, api_key):
    """Grade the assignment using Google's Generative AI."""
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt
        prompt = f"""
        You are an expert assignment grader. Please grade the following student submission based on the assignment requirements and solution.
        
        Assignment Requirements (including rubric):
        {assignment_text}
        
        Solution:
        {solution_text}
        
        Student Submission:
        {submission_text}
        
        Please provide:
        1. A detailed grade (out of 100)
        2. Specific feedback on what was done well
        3. Areas for improvement
        4. Suggestions for better performance
        """
        
        # Generate response
        response = model.generate_content(prompt)
        return response.text
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
                    st.markdown("### Grading Results")
                    st.markdown(result)
            else:
                st.error("Failed to extract text from one or more PDF files. Please ensure they are text-based PDFs.")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p>Built with ❤️ using Streamlit and Google's Generative AI</p>
    <p>For more information, visit the <a href='https://github.com/dan-shah/streamlit-grader'>GitHub repository</a></p>
</div>
""", unsafe_allow_html=True) 