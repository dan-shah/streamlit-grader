import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import re
import json
from typing import Dict, Any, Optional

from models import GradingFeedback, RubricAnalysisResponse

# Rubric Analysis
def analyze_rubric(assignment_rubric_text: str, api_key: str) -> RubricAnalysisResponse:
    """Analyze the rubric/assignment to provide improvement recommendations and grading advice."""
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model with Gemini 2.0 Flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt
        prompt = f"""
        You are an expert educator reviewing a grading rubric and assignment. 
        Please analyze the following assignment and rubric to provide:
        
        1. RUBRIC IMPROVEMENT RECOMMENDATIONS: Analyze the rubric critically and suggest specific improvements 
           that would make it clearer and more effective for consistent grading. Focus on structural improvements, 
           clarity enhancements, and adding specific criteria that may be missing.
        
        2. GRADING ADVICE: Provide specific advice for any AI or human grader on how to interpret and apply 
           this rubric consistently. Highlight key points to look for in submissions, potential pitfalls or 
           misconceptions, and advice for fair evaluation.
        
        Assignment and Rubric:
        {assignment_rubric_text}
        
        Format your response with clear section headers "## RUBRIC IMPROVEMENT RECOMMENDATIONS" and "## GRADING ADVICE".
        Be specific, actionable, and concise in your recommendations.
        """
        
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Extract the two sections
        improvements_section = ""
        advice_section = ""
        
        # Extract Rubric Improvement Recommendations
        improvements_match = re.search(r'## RUBRIC IMPROVEMENT RECOMMENDATIONS(.*?)(?=## GRADING ADVICE|\Z)', response_text, re.DOTALL)
        if improvements_match:
            improvements_section = improvements_match.group(1).strip()
        
        # Extract Grading Advice
        advice_match = re.search(r'## GRADING ADVICE(.*)', response_text, re.DOTALL)
        if advice_match:
            advice_section = advice_match.group(1).strip()
        
        return RubricAnalysisResponse(
            improvements=improvements_section,
            advice=advice_section,
            full_response=response_text
        )
    except Exception as e:
        raise Exception(f"Error analyzing rubric: {str(e)}")

# Assignment Grading
def grade_assignment(
    assignment_text: str, 
    solution_text: str, 
    submission_text: str, 
    api_key: str, 
    include_grading_advice: bool = False, 
    grading_advice: Optional[str] = None
) -> GradingFeedback:
    """Grade the assignment using Gemini with structured output."""
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model with Gemini 2.0 Flash
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        # Create the base prompt
        prompt = f"""
        You are an expert teacher grading an assignment. Please grade the following student submission 
        based on the assignment requirements and provided solution.
        
        Assignment Requirements (including rubric):
        {assignment_text}
        
        Solution:
        {solution_text}
        
        Student Submission:
        {submission_text}
        """
        
        # Include grading advice if requested
        if include_grading_advice and grading_advice:
            prompt += f"""
            
            IMPORTANT GRADING ADVICE:
            {grading_advice}
            """
        
        # Add structured output instructions
        prompt += """
        
        Please provide a detailed evaluation focusing on:
        1. Overall grade with clear justification
        2. Specific strengths shown in the submission
        3. EXPLICIT point deductions - exactly where and why points were lost
        4. Concept-focused improvement suggestions that would help the student better understand the material
        
        IMPORTANT: The total points deducted MUST exactly equal (100 - final_grade). For example, if you assign a grade of 85/100, you must show exactly 15 points of deductions with specific reasons.
        
        Your response should be provided as structured JSON following this schema:
        
        class PointDeduction:
            area: str  # Area where points were deducted
            points: int  # Number of points deducted
            reason: str  # Reason for the deduction
        
        class ConceptImprovement:
            concept: str  # Concept that needs better understanding
            suggestion: str  # Specific suggestion to improve understanding
        
        class GradingFeedback:
            numerical_grade: int  # Numerical grade from 0-100
            overall_assessment: str  # Overall assessment of the submission
            strengths: list[str]  # List of strengths in the submission
            point_deductions: list[PointDeduction]  # Areas where points were deducted
            concept_improvements: list[ConceptImprovement]  # Suggestions to better grasp concepts
        
        Please respond with ONLY a valid JSON object following this schema. Make sure your total point deductions logically explain how you arrived at the final grade and EXACTLY add up to (100 - numerical_grade).
        """
        
        # Generate structured response
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Extract the JSON part from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', text_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON without code blocks
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # If no JSON found, return the raw text
                raise Exception("Could not find valid JSON in the response")
        
        try:
            # Parse the JSON
            data = json.loads(json_str)
            # Validate with Pydantic
            grading_feedback = GradingFeedback(**data)
            return grading_feedback
        except Exception as e:
            raise Exception(f"Error parsing structured response: {str(e)}")
            
    except Exception as e:
        raise Exception(f"Error grading assignment: {str(e)}") 