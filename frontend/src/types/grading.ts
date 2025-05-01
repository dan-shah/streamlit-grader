export interface PointDeduction {
  area: string;
  points: number;
  reason: string;
}

export interface ConceptImprovement {
  concept: string;
  suggestion: string;
}

export interface GradingResult {
  id: string;
  strengths: string[];
  point_deductions: PointDeduction[];
  concept_improvements: ConceptImprovement[];
  total_score: number;
  overall_assessment: string;
}

export interface GradingFeedback extends GradingResult {
  feedback: string;
}

export interface GradeRequest {
  api_key: string;
  include_grading_advice: boolean;
  grading_advice?: string;
}

export interface ScoreCalculationResponse {
  calculatedScore: number;
  reportedScore: number;
  discrepancy: boolean;
  totalDeductions: number;
} 