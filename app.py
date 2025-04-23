import streamlit as st
import google.generativeai as genai
import PyPDF2
import os
from dotenv import load_dotenv
import io

# Load environment variables
load_dotenv()

# Configure Google Generative AI
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def grade_assignment(assignment_rubric_text, solution_text, student_text):
    """Grade the assignment using Gemini."""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Construct the detailed prompt
    prompt_parts = [
        "Act as an expert teacher grading an assignment. Your task is to provide a comprehensive evaluation of the student's submission compared to the provided solution.",
        "\\n**Instructions:**\\n",
        "1.  **Compare Thoroughly:** Analyze the student's submission against the solution, noting similarities, differences, correct concepts, errors, and omissions.",
        "2.  **Use the Assignment and Rubric:** The assignment document includes both the assignment requirements and grading rubric. Use these criteria when evaluating.",
        "3.  **Provide Structured Feedback:** Organize your response into the following sections using markdown headings:",
        "    *   **## Overall Grade:** Provide a numerical grade between 0 and 100.",
        "    *   **## Detailed Feedback:** Explain the reasoning behind the grade. Highlight strengths and weaknesses. Reference specific parts of the student's submission and the solution.",
        "    *   **## Areas for Improvement:** Offer specific, actionable suggestions for how the student can improve their understanding or performance on similar tasks in the future.",
        "\\n**Input Documents:**\\n",
        f"*   **Assignment and Rubric:**\\n    ```\\n{assignment_rubric_text}\\n    ```\\n",
        f"*   **Solution:**\\n    ```\\n{solution_text}\\n    ```\\n",
        f"*   **Student Submission:**\\n    ```\\n{student_text}\\n    ```"
    ]
    
    prompt_parts.append("\\n**Begin Evaluation:**\\n")

    prompt = "\\n".join(prompt_parts)

    # Generate content
    response = model.generate_content(prompt)
    return response.text

def main():
    st.title("AI Assignment Grader")
    st.write("Upload assignment (with rubric), solution, and student submission PDFs for automated grading.")
    
    # File uploaders
    assignment_rubric_file = st.file_uploader("Upload Assignment and Rubric PDF", type=['pdf'])
    solution_file = st.file_uploader("Upload Solution PDF", type=['pdf'])
    student_file = st.file_uploader("Upload Student Submission PDF", type=['pdf'])
    
    if st.button("Grade Assignment"):
        if assignment_rubric_file and solution_file and student_file:
            try:
                # Extract text from PDFs
                assignment_rubric_text = extract_text_from_pdf(assignment_rubric_file)
                solution_text = extract_text_from_pdf(solution_file)
                student_text = extract_text_from_pdf(student_file)
                
                # Show loading spinner
                with st.spinner("Grading assignment..."):
                    # Get grading results
                    results = grade_assignment(assignment_rubric_text, solution_text, student_text)
                    
                    # Display results
                    st.subheader("Grading Results")
                    st.write(results)
                    
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
        else:
            st.warning("Please upload assignment (with rubric), solution, and student submission PDFs.")

if __name__ == "__main__":
    main() 