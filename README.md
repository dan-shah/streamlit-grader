# AI Assignment Grader

This Streamlit application uses Google's Generative AI (Gemini) to automate the grading of assignments. It compares student submissions against solution PDFs and optional rubrics to provide detailed feedback and grades.

## Features

- Upload solution PDFs
- Upload student submission PDFs
- Optional rubric upload
- Automated grading using Gemini AI
- Detailed feedback and numerical grades
- Simple and intuitive interface

## Sample Data

The repository includes sample data files in the `data/` directory:
- `arima_hw5_solution_perfect.pdf/docx`: Example solution
- `arima_hw5_student_Cplus.pdf/docx`: Example student submission
- `arima_hw5_grading_rubric.pdf/docx`: Example grading rubric

## Setup & Deployment

### Option 1: Docker Deployment (Recommended)

1. Clone this repository:
   ```bash
   git clone https://github.com/dan-shah/streamlit-grader.git
   cd streamlit-grader
   ```

2. Create a `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Open your browser and navigate to `http://localhost:8501`

### Option 2: Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/dan-shah/streamlit-grader.git
   cd streamlit-grader
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

5. Run the application:
   ```bash
   streamlit run app.py
   ```

## Getting Your Google API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## Requirements

- Python 3.7+
- Google API key with access to Gemini
- PDF files for solutions and submissions
- Docker (optional, for containerized deployment)

## Note

Make sure your PDFs are text-based and not scanned images, as the application extracts text from the PDFs for comparison. 