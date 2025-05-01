export interface RubricAnalysisResponse {
  improvements: string;
  advice: string;
  full_response?: string;
}

export interface RubricAnalysisRequest {
  api_key: string;
} 