from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import io

from app.models import RubricAnalysisResponse, RubricAnalysisRequest
from app.services.ai_service import analyze_rubric
from app.utils import extract_text_from_pdf

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
        print(f"Starting rubric analysis with file: {assignment.filename}")
        
        # Extract text from PDF
        assignment_content = await assignment.read()
        print(f"Read {len(assignment_content)} bytes from PDF")
        
        # Reset file pointers
        assignment.file.seek(0)
        
        # Extract text
        print("Attempting to extract text from PDF...")
        assignment_text = extract_text_from_pdf(io.BytesIO(assignment_content))
        
        if not assignment_text:
            print("Failed to extract text from PDF")
            raise HTTPException(
                status_code=400, 
                detail="Failed to extract text from the PDF file. Please ensure it is a text-based PDF."
            )
        
        print(f"Successfully extracted {len(assignment_text)} characters from PDF")
        
        # Analyze the rubric
        print("Starting AI analysis...")
        result = analyze_rubric(
            assignment_rubric_text=assignment_text,
            api_key=api_key
        )
        
        if not result:
            print("AI analysis returned no results")
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze rubric. The AI service returned no results."
            )
        
        print("Successfully completed rubric analysis")
        return result
        
    except HTTPException:
        print("HTTP Exception raised:", str(e))
        raise
    except Exception as e:
        print(f"Unexpected error during rubric analysis: {str(e)}")
        print(f"Error type: {type(e)}")
        error_msg = str(e)
        if "API key" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail="Invalid API key. Please check your Google API key and try again."
            )
        elif "quota" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="API quota exceeded. Please try again later or check your API key usage."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing rubric: {error_msg}"
            )

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