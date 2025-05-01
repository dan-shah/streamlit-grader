from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PointDeduction(BaseModel):
    area: str = Field(..., description="Area where points were deducted")
    points: int = Field(..., description="Number of points deducted")
    reason: str = Field(..., description="Reason for the deduction")

class ConceptImprovement(BaseModel):
    concept: str = Field(..., description="Concept that needs better understanding")
    suggestion: str = Field(..., description="Specific suggestion to improve understanding")

class GradingFeedback(BaseModel):
    numerical_grade: int = Field(..., description="Numerical grade from 0-100", ge=0, le=100)
    overall_assessment: str = Field(..., description="Overall assessment of the submission")
    strengths: List[str] = Field(..., description="List of strengths in the submission")
    point_deductions: List[PointDeduction] = Field(..., description="Areas where points were deducted")
    concept_improvements: List[ConceptImprovement] = Field(..., description="Suggestions to better grasp concepts")

class ImprovementSuggestion(BaseModel):
    area: str = Field(..., description="Area of improvement")
    suggestion: str = Field(..., description="Specific suggestion for improvement")

class RubricAnalysisResponse(BaseModel):
    improvements: str = Field(..., description="Rubric improvement recommendations")
    advice: str = Field(..., description="Grading advice")
    full_response: Optional[str] = Field(None, description="Full response from the AI model")

class GradeRequest(BaseModel):
    api_key: str = Field(..., description="Google API Key")
    include_grading_advice: bool = Field(False, description="Whether to include grading advice in the prompt")
    grading_advice: Optional[str] = Field(None, description="Grading advice to include in the prompt")

class RubricAnalysisRequest(BaseModel):
    api_key: str = Field(..., description="Google API Key")

class ApiKeyModel(BaseModel):
    api_key: str = Field(..., description="Google API Key") 