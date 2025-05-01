import axios from 'axios';
import { GradingFeedback, ScoreCalculationResponse } from '../types/grading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const gradeAssignment = async (formData: FormData): Promise<GradingFeedback> => {
  try {
    const response = await axios.post(`${API_URL}/grading/grade-assignment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error grading assignment');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const calculateTotalScore = async (gradingFeedback: GradingFeedback): Promise<ScoreCalculationResponse> => {
  try {
    const response = await axios.post(`${API_URL}/grading/calculate-total-score`, gradingFeedback);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error calculating score');
    }
    throw new Error('An unexpected error occurred');
  }
}; 