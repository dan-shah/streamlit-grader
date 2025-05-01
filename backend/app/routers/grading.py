from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import io
from pydantic import ValidationError
import json

from models import GradingFeedback, GradeRequest
from services.ai_service import grade_assignment
from utils import extract_text_from_pdf

router = APIRouter()

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