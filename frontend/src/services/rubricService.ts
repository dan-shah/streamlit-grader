import axios from 'axios';
import { RubricAnalysisResponse } from '../types/rubric';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

export const analyzeRubric = async (formData: FormData): Promise<RubricAnalysisResponse> => {
  try {
    const response = await axios.post(`${API_URL}/rubric/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Rubric analysis error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your input and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please check your API key.');
      } else if (error.response?.status === 429) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.response?.status === 500) {
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Server error';
        throw new Error(`Server error: ${errorDetail}`);
      } else {
        throw new Error('Error analyzing rubric. Please try again.');
      }
    }
    throw new Error('An unexpected error occurred while analyzing the rubric.');
  }
}; 