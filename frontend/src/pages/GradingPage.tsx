import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  VStack,
  HStack,
  useToast,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaFileDownload } from 'react-icons/fa';
import FileUpload from '../components/FileUpload';
import PDFViewer from '../components/PDFViewer';
import { gradeAssignment } from '../services/gradingService';
import { loadSampleFiles, type SampleFiles } from '../services/sampleService';

interface FormData {
  apiKey: string;
  assignment: File | null;
  solution: File | null;
  submission: File | null;
  includeGradingAdvice: boolean;
  gradingAdvice: string;
}

const GradingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    apiKey: '',
    assignment: null,
    solution: null,
    submission: null,
    includeGradingAdvice: false,
    gradingAdvice: '',
  });
  
  const [selectedPDF, setSelectedPDF] = useState<{ file: File | null; title: string } | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData({ ...formData, [fieldName]: file });
  };

  const handleViewPDF = (file: File | null, title: string) => {
    if (file) {
      setSelectedPDF({ file, title });
    }
  };

  const loadSampleFilesHandler = async () => {
    try {
      setIsLoading(true);
      const samples = await loadSampleFiles();
      setFormData(prev => ({
        ...prev,
        assignment: samples.assignment,
        solution: samples.solution,
        submission: samples.submission,
      }));
      toast({
        title: 'Sample Files Loaded',
        description: 'Sample PDFs have been loaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Loading Samples',
        description: error instanceof Error ? error.message : 'Failed to load sample files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Google API Key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!formData.assignment || !formData.solution || !formData.submission) {
      toast({
        title: 'Files Required',
        description: 'Please upload all required files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Preparing form data for submission...');
      const formPayload = new FormData();
      formPayload.append('api_key', formData.apiKey);
      formPayload.append('assignment', formData.assignment);
      formPayload.append('solution', formData.solution);
      formPayload.append('submission', formData.submission);
      formPayload.append('include_grading_advice', formData.includeGradingAdvice.toString());
      
      if (formData.includeGradingAdvice && formData.gradingAdvice) {
        formPayload.append('grading_advice', formData.gradingAdvice);
      }

      console.log('Submitting grading request...');
      const result = await gradeAssignment(formPayload);
      console.log('Received grading result:', result);
      
      // Store result in localStorage
      localStorage.setItem('gradingResult', JSON.stringify(result));
      
      // Navigate to results page
      navigate('/results/latest');
      
      toast({
        title: 'Grading Completed',
        description: 'Assignment has been successfully graded',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Detailed submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error details:', errorMessage);
      
      toast({
        title: 'Error Grading Assignment',
        description: errorMessage,
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading mb={6}>Grade Assignment</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          <FormControl isRequired>
            <FormLabel>Google API Key</FormLabel>
            <Input
              name="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="Enter your Google API Key"
            />
          </FormControl>

          <Divider />
          
          <VStack spacing={4} align="start">
            <HStack width="100%" justify="space-between">
              <Heading size="md">Upload Files</Heading>
              <Button
                onClick={loadSampleFilesHandler}
                isLoading={isLoading}
                colorScheme="blue"
                variant="outline"
                leftIcon={<FaFileDownload />}
              >
                Load Sample Files
              </Button>
            </HStack>
            
            <HStack width="100%" spacing={8} alignItems="flex-start">
              <FormControl isRequired flex={1}>
                <FormLabel>Assignment & Rubric</FormLabel>
                <Box position="relative">
                  <FileUpload
                    onFileChange={(file) => handleFileChange('assignment', file)}
                    acceptedFileTypes="application/pdf"
                    fieldName="assignment"
                  />
                  {formData.assignment && (
                    <Tooltip label="View PDF">
                      <IconButton
                        icon={<FaEye />}
                        aria-label="View PDF"
                        position="absolute"
                        top="0"
                        right="-45px"
                        onClick={() => handleViewPDF(formData.assignment, 'Assignment & Rubric')}
                      />
                    </Tooltip>
                  )}
                </Box>
              </FormControl>
              
              <FormControl isRequired flex={1}>
                <FormLabel>Solution</FormLabel>
                <Box position="relative">
                  <FileUpload
                    onFileChange={(file) => handleFileChange('solution', file)}
                    acceptedFileTypes="application/pdf"
                    fieldName="solution"
                  />
                  {formData.solution && (
                    <Tooltip label="View PDF">
                      <IconButton
                        icon={<FaEye />}
                        aria-label="View PDF"
                        position="absolute"
                        top="0"
                        right="-45px"
                        onClick={() => handleViewPDF(formData.solution, 'Solution')}
                      />
                    </Tooltip>
                  )}
                </Box>
              </FormControl>
              
              <FormControl isRequired flex={1}>
                <FormLabel>Student Submission</FormLabel>
                <Box position="relative">
                  <FileUpload
                    onFileChange={(file) => handleFileChange('submission', file)}
                    acceptedFileTypes="application/pdf"
                    fieldName="submission"
                  />
                  {formData.submission && (
                    <Tooltip label="View PDF">
                      <IconButton
                        icon={<FaEye />}
                        aria-label="View PDF"
                        position="absolute"
                        top="0"
                        right="-45px"
                        onClick={() => handleViewPDF(formData.submission, 'Student Submission')}
                      />
                    </Tooltip>
                  )}
                </Box>
              </FormControl>
            </HStack>
          </VStack>

          <Divider />
          
          <FormControl>
            <FormLabel>Grading Options</FormLabel>
            <Checkbox
              name="includeGradingAdvice"
              isChecked={formData.includeGradingAdvice}
              onChange={handleCheckboxChange}
              mb={4}
            >
              Include custom grading advice
            </Checkbox>
            
            {formData.includeGradingAdvice && (
              <Textarea
                name="gradingAdvice"
                value={formData.gradingAdvice}
                onChange={handleInputChange}
                placeholder="Enter specific grading advice for this assignment..."
                size="md"
                rows={4}
              />
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            isLoading={isLoading}
            loadingText="Grading..."
          >
            Grade Assignment
          </Button>
        </Stack>
      </form>

      {selectedPDF && selectedPDF.file && (
        <PDFViewer
          file={selectedPDF.file}
          title={selectedPDF.title}
          isOpen={!!selectedPDF}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </Box>
  );
};

export default GradingPage; 