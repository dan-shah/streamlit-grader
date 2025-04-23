# AI Assignment Grader

This Streamlit application uses Google's Generative AI (Gemini) to automate the grading of assignments. It compares student submissions against solution PDFs and optional rubrics to provide detailed feedback and grades.

## Features

- Upload solution PDFs
- Upload student submission PDFs
- Optional rubric upload
- Automated grading using Gemini AI
- Detailed feedback and numerical grades
- Simple and intuitive interface

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
   You can get your API key from the [Google AI Studio](https://makersuite.google.com/app/apikey)

## Usage

1. Run the Streamlit app:
   ```bash
   streamlit run app.py
   ```
2. Open your web browser and navigate to the provided local URL
3. Upload the solution PDF
4. Upload the student submission PDF
5. (Optional) Upload a rubric PDF
6. Click "Grade Assignment" to get the results

## Requirements

- Python 3.7+
- Google API key with access to Gemini
- PDF files for solutions and submissions

## Note

Make sure your PDFs are text-based and not scanned images, as the application extracts text from the PDFs for comparison. 