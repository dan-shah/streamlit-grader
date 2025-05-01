export interface PointDeduction {
  area: string;
  points: number;
  reason: string;
}

export interface ConceptImprovement {
  concept: string;
  suggestion: string;
}

export interface GradingFeedback {
  numerical_grade: number;
  overall_assessment: string;
  strengths: string[];
  point_deductions: PointDeduction[];
  concept_improvements: ConceptImprovement[];
}

export interface GradeRequest {
  api_key: string;
  include_grading_advice: boolean;
  grading_advice?: string;
}

export interface ScoreCalculationResponse {
  calculated_score: number;
  reported_score: number;
  discrepancy: boolean;
  total_deductions: number;
} 