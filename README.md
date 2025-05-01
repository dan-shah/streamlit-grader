# AI Assignment Grader

A modern web application for automated assignment grading using Google's Gemini AI, with a FastAPI backend and React TypeScript frontend.

## Features

- **AI-Powered Grading**: Grade assignments quickly and consistently using Google's Gemini AI with structured feedback
- **Rubric Analysis**: Analyze assignment rubrics to get improvement recommendations and specific advice for consistent grading
- **Detailed Feedback**: Provide students with clear strengths, areas for improvement, and concept-specific suggestions
- **Score Calculation**: Accurately calculate final scores based on point deductions
- **Multiple Export Options**: Export grading results as PDF, Word Document, or CSV

## Technology Stack

### Backend
- FastAPI
- Pydantic
- Google Generative AI (Gemini)
- PyPDF2 for PDF text extraction
- ReportLab and python-docx for document generation

### Frontend
- React with TypeScript
- Chakra UI for modern, accessible interface
- React Router for navigation
- Axios for API requests
- React Dropzone for file uploads

## Getting Started

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 18+ (for frontend)
- Docker and Docker Compose (optional)
- Google API Key with Gemini Access

### Development Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will be available at [http://localhost:8000](http://localhost:8000).

#### Frontend
```bash
cd frontend
npm install
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Using Docker
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

### Grading
- `POST /api/grading/grade-assignment`: Grade an assignment based on the provided files and options
- `POST /api/grading/calculate-total-score`: Calculate the total score based on point deductions

### Rubric Analysis
- `POST /api/rubric/analyze`: Analyze a rubric/assignment to provide improvement recommendations and grading advice
- `GET /api/rubric/improvements/{analysis_id}`: Get rubric improvement recommendations from a previous analysis
- `GET /api/rubric/advice/{analysis_id}`: Get grading advice from a previous analysis

## License

This project is licensed under the MIT License - see the LICENSE file for details. 