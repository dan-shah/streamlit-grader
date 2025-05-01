from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from typing import Optional
import io
from pathlib import Path
from pydantic import ValidationError
import json
import zipfile
from datetime import datetime

from app.models import GradingFeedback, GradeRequest
from app.services.ai_service import grade_assignment
from app.utils import extract_text_from_pdf, generate_results_pdf, export_to_docx

# Get the directory of the current file
CURRENT_DIR = Path(__file__).parent
# Go up three levels (routers -> app -> backend -> project_root) then into 'data'
DATA_DIR = CURRENT_DIR.parent.parent.parent / "data"

router = APIRouter()

@router.get("/sample-files")
async def get_sample_files():
    """
    Get sample PDF files for testing the grading system.
    Returns a ZIP file containing sample assignment, solution, and submission PDFs.
    """
    try:
        # Use the calculated absolute path
        data_dir = DATA_DIR 
        if not data_dir.exists():
             raise HTTPException(status_code=500, detail=f"Data directory not found at expected location: {data_dir}")

        assignment_file = data_dir / "arima_hw5_assignment_and_rubric.pdf"
        solution_file = data_dir / "arima_hw5_solution_perfect.pdf"
        submission_file = data_dir / "arima_hw5_student_Cplus.pdf"
        
        files_to_zip = {
            "sample_assignment.pdf": assignment_file,
            "sample_solution.pdf": solution_file,
            "sample_submission.pdf": submission_file
        }

        for file_path in files_to_zip.values():
            if not file_path.exists():
                raise HTTPException(
                    status_code=404,
                    detail=f"Sample file not found: {file_path.name}. Please ensure the data directory contains the required files."
                )
        
        # Create zip in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            for filename, file_path in files_to_zip.items():
                zipf.write(file_path, arcname=filename)
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=sample_files.zip"}
        )

    except HTTPException as e:
        # Re-raise HTTPExceptions to keep their status code and detail
        raise e
    except Exception as e:
        # Catch other potential errors (e.g., file reading issues)
        print(f"Error creating zip file: {e}") # Add logging for debugging
        raise HTTPException(status_code=500, detail=f"Internal server error creating sample file archive: {str(e)}")

@router.post("/grade-assignment", response_model=GradingFeedback)
async def grade_assignment_endpoint(
    assignment: UploadFile = File(...),
    solution: UploadFile = File(...),
    submission: UploadFile = File(...),
    api_key: str = Form(...),
    include_grading_advice: bool = Form(False),
    grading_advice: Optional[str] = Form(None)
):
    """
    Grade an assignment based on the provided files and options.
    
    - **assignment**: PDF file containing the assignment details and rubric
    - **solution**: PDF file containing the solution
    - **submission**: PDF file containing the student submission
    - **api_key**: Google API key for Gemini
    - **include_grading_advice**: Whether to include grading advice in the prompt
    - **grading_advice**: Custom grading advice to include in the prompt
    """
    try:
        # Extract text from PDFs
        assignment_content = await assignment.read()
        solution_content = await solution.read()
        submission_content = await submission.read()
        
        # Reset file pointers
        assignment.file.seek(0)
        solution.file.seek(0)
        submission.file.seek(0)
        
        # Extract text
        assignment_text = extract_text_from_pdf(io.BytesIO(assignment_content))
        solution_text = extract_text_from_pdf(io.BytesIO(solution_content))
        submission_text = extract_text_from_pdf(io.BytesIO(submission_content))
        
        if not all([assignment_text, solution_text, submission_text]):
            raise HTTPException(
                status_code=400, 
                detail="Failed to extract text from one or more PDF files. Please ensure they are text-based PDFs."
            )
        
        # Grade the assignment
        result = grade_assignment(
            assignment_text=assignment_text,
            solution_text=solution_text,
            submission_text=submission_text,
            api_key=api_key,
            include_grading_advice=include_grading_advice,
            grading_advice=grading_advice
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-total-score")
async def calculate_total_score(grading_feedback: GradingFeedback):
    """
    Calculate the total score based on point deductions.
    
    - **grading_feedback**: The grading feedback object
    """
    try:
        # Calculate total deductions
        total_deducted = 0
        for deduction in grading_feedback.point_deductions:
            total_deducted += deduction.points
        
        # Calculate final score
        final_score = 100 - total_deducted
        
        # Check for discrepancy
        if final_score != grading_feedback.numerical_grade:
            return {
                "calculated_score": final_score,
                "reported_score": grading_feedback.numerical_grade,
                "discrepancy": True,
                "total_deductions": total_deducted
            }
        else:
            return {
                "calculated_score": final_score,
                "reported_score": grading_feedback.numerical_grade,
                "discrepancy": False,
                "total_deductions": total_deducted
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-pdf")
async def download_pdf(result: GradingFeedback):
    """Generate and download a PDF of the grading results."""
    try:
        pdf_buffer = generate_results_pdf(result)
        if not pdf_buffer:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
            
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=grading-result-{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-docx")
async def download_docx(result: GradingFeedback):
    """Generate and download a DOCX of the grading results."""
    try:
        docx_file = export_to_docx(result)
        if not docx_file:
            raise HTTPException(status_code=500, detail="Failed to generate DOCX")
            
        return StreamingResponse(
            docx_file,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=grading-result-{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 