import axios from 'axios';
import { GradingFeedback, ScoreCalculationResponse, GradingResult } from '../types/grading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

export const gradeAssignment = async (formData: FormData): Promise<GradingFeedback> => {
  try {
    console.log('Sending grading request to:', `${API_URL}/grading/grade-assignment`);
    const response = await axios.post(`${API_URL}/grading/grade-assignment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Grading response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed grading error:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Headers:', error.response?.headers);
      throw new Error(
        `Grading failed: ${error.response?.data?.detail || error.message || 'Unknown error'}`
      );
    }
    throw new Error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const calculateTotalScore = async (result: GradingResult): Promise<ScoreCalculationResponse> => {
  // Mock implementation - replace with actual API call if needed
  const totalDeductions = result.point_deductions.reduce((total, deduction) => total + deduction.points, 0);
  const calculatedScore = 100 - totalDeductions;
  
  return {
    calculatedScore,
    reportedScore: result.total_score,
    discrepancy: calculatedScore !== result.total_score,
    totalDeductions
  };
};

export const downloadPDF = async (result: GradingResult): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/grading/download-pdf`, result, {
      responseType: 'blob'
    });
    
    if (!response.data) {
      throw new Error('No PDF data received from server');
    }
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grading-result-${result.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Failed to generate PDF');
        } catch {
          throw new Error(errorText || 'Failed to generate PDF');
        }
      }
      throw new Error(error.response?.data?.detail || 'Failed to generate PDF');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to generate PDF');
  }
};

export const downloadDocx = async (result: GradingResult): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/grading/download-docx`, result, {
      responseType: 'blob'
    });
    
    if (!response.data) {
      throw new Error('No DOCX data received from server');
    }
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grading-result-${result.id}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Failed to generate DOCX');
        } catch {
          throw new Error(errorText || 'Failed to generate DOCX');
        }
      }
      throw new Error(error.response?.data?.detail || 'Failed to generate DOCX');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to generate DOCX');
  }
}; 