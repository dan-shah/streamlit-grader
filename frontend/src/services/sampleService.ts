import axios from 'axios';
import JSZip from 'jszip';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

export interface SampleFiles {
  assignment: File | null;
  solution: File | null;
  submission: File | null;
}

export const loadSampleFiles = async (): Promise<SampleFiles> => {
  try {
    const response = await axios.get(`${API_URL}/grading/sample-files`, {
      responseType: 'blob'
    });
    
    const zip = await JSZip.loadAsync(response.data);
    
    const assignmentFile = zip.file('sample_assignment.pdf');
    const solutionFile = zip.file('sample_solution.pdf');
    const submissionFile = zip.file('sample_submission.pdf');

    if (!assignmentFile || !solutionFile || !submissionFile) {
      throw new Error('One or more sample files not found in the zip archive.');
    }

    const assignmentBlob = await assignmentFile.async('blob');
    const solutionBlob = await solutionFile.async('blob');
    const submissionBlob = await submissionFile.async('blob');

    return {
      assignment: new File([assignmentBlob], 'sample_assignment.pdf', { type: 'application/pdf' }),
      solution: new File([solutionBlob], 'sample_solution.pdf', { type: 'application/pdf' }),
      submission: new File([submissionBlob], 'sample_submission.pdf', { type: 'application/pdf' })
    };
  } catch (error) {
    console.error("Error loading or processing sample files:", error);
    if (axios.isAxiosError(error)) {
      let detail = 'Error loading sample files';
      if (error.response?.data) {
        try {
          const errorText = await (error.response.data as Blob).text();
          try {
            const errorJson = JSON.parse(errorText);
            detail = errorJson.detail || errorText;
          } catch { 
            detail = errorText;
          } 
        } catch {
          detail = error.response?.statusText || 'Error loading sample files';
        }
      }
      throw new Error(detail);
    } else if (error instanceof Error) {
        throw new Error(error.message || 'An unexpected error occurred processing sample files');
    } else {
        throw new Error('An unexpected error occurred');
    }
  }
}; 