import axios from 'axios';
import { RubricAnalysisResponse } from '../types/rubric';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const analyzeRubric = async (formData: FormData): Promise<RubricAnalysisResponse> => {
  try {
    const response = await axios.post(`${API_URL}/rubric/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error analyzing rubric');
    }
    throw new Error('An unexpected error occurred');
  }
}; 