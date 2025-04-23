# AI Assignment Grader

This Streamlit application uses Google's Generative AI (Gemini) to automate the grading of assignments. It compares student submissions against assignment requirements (which include the rubric) and solution PDFs to provide detailed feedback and grades.

**Live Demo:** [ai-grader.streamlit.app](https://ai-grader.streamlit.app)

## Features

- Upload assignment PDF (includes rubric)
- Upload solution PDFs
- Upload student submission PDFs
- Automated grading using Gemini AI
- Detailed feedback and numerical grades
- Simple and intuitive interface
- Sample files for testing
- Secure API key input

## Sample Data

The repository includes sample data files in the `data/` directory:
- `arima_hw5_assignment_and_rubric.pdf`: Example assignment with rubric
- `arima_hw5_solution_perfect.pdf`: Example solution
- `arima_hw5_student_Cplus.pdf`: Example student submission

## Deployment Options

### Option 1: Streamlit Community Cloud (Recommended)

1. Visit the [Streamlit Community Cloud](https://share.streamlit.io/)
2. Sign in with your GitHub account
3. Connect this repository
4. Deploy the application
5. Users can:
   - Enter their Google API key securely
   - Use sample files for testing
   - Upload their own PDFs

### Option 2: Docker Deployment

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

### Option 3: Local Development

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

## Usage

1. Enter your Google API key (required)
2. Choose to use sample files or upload your own:
   - Sample files: Check "Use sample files for testing"
   - Your own files: Upload PDFs manually
3. Click "Grade Assignment" to get the results

The application will:
- Compare the student's submission against the assignment requirements and rubric
- Evaluate the solution against the assignment criteria
- Generate a detailed grade and feedback

## Getting Your Google API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on 'Create API Key'
4. Copy the generated API key
5. Paste it in the application's API key input field

## Requirements

- Python 3.13
- Google API key with access to Gemini
- PDF files for assignments (with rubric), solutions, and submissions
- Docker (optional, for containerized deployment)

## Note

Make sure your PDFs are text-based and not scanned images, as the application extracts text from the PDFs for comparison. 