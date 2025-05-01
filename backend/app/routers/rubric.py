from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import io

from models import RubricAnalysisResponse, RubricAnalysisRequest
from services.ai_service import analyze_rubric
from utils import extract_text_from_pdf

router = APIRouter()

@router.post("/analyze", response_model=RubricAnalysisResponse)
async def analyze_rubric_endpoint(
    assignment: UploadFile = File(...),
    api_key: str = Form(...)
):
    """
    Analyze a rubric/assignment to provide improvement recommendations and grading advice.
    
    - **assignment**: PDF file containing the assignment details and rubric
    - **api_key**: Google API key for Gemini
    """
    try:
        # Extract text from PDF
        assignment_content = await assignment.read()
        
        # Reset file pointers
        assignment.file.seek(0)
        
        # Extract text
        assignment_text = extract_text_from_pdf(io.BytesIO(assignment_content))
        
        if not assignment_text:
            raise HTTPException(
                status_code=400, 
                detail="Failed to extract text from the PDF file. Please ensure it is a text-based PDF."
            )
        
        # Analyze the rubric
        result = analyze_rubric(
            assignment_rubric_text=assignment_text,
            api_key=api_key
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/improvements/{analysis_id}")
async def get_rubric_improvements(analysis_id: str):
    """
    Get rubric improvement recommendations from a previous analysis.
    
    - **analysis_id**: ID of the previous analysis
    """
    # This would typically retrieve from a database
    # For now, we'll return a placeholder
    raise HTTPException(status_code=501, detail="This endpoint is not yet implemented")

@router.get("/advice/{analysis_id}")
async def get_grading_advice(analysis_id: str):
    """
    Get grading advice from a previous analysis.
    
    - **analysis_id**: ID of the previous analysis
    """
    # This would typically retrieve from a database
    # For now, we'll return a placeholder
    raise HTTPException(status_code=501, detail="This endpoint is not yet implemented") 