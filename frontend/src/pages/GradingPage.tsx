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
  Text,
  Textarea,
  VStack,
  HStack,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { gradeAssignment } from '../services/gradingService';

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
      const formPayload = new FormData();
      formPayload.append('api_key', formData.apiKey);
      formPayload.append('assignment', formData.assignment);
      formPayload.append('solution', formData.solution);
      formPayload.append('submission', formData.submission);
      formPayload.append('include_grading_advice', formData.includeGradingAdvice.toString());
      
      if (formData.includeGradingAdvice && formData.gradingAdvice) {
        formPayload.append('grading_advice', formData.gradingAdvice);
      }

      const result = await gradeAssignment(formPayload);
      
      // Store result in localStorage or context
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
      toast({
        title: 'Error Grading Assignment',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
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
            <Heading size="md">Upload Files</Heading>
            
            <HStack width="100%" spacing={8} alignItems="flex-start">
              <FormControl isRequired flex={1}>
                <FormLabel>Assignment & Rubric</FormLabel>
                <FileUpload
                  onFileChange={(file) => handleFileChange('assignment', file)}
                  acceptedFileTypes="application/pdf"
                  fieldName="assignment"
                />
              </FormControl>
              
              <FormControl isRequired flex={1}>
                <FormLabel>Solution</FormLabel>
                <FileUpload
                  onFileChange={(file) => handleFileChange('solution', file)}
                  acceptedFileTypes="application/pdf"
                  fieldName="solution"
                />
              </FormControl>
              
              <FormControl isRequired flex={1}>
                <FormLabel>Student Submission</FormLabel>
                <FileUpload
                  onFileChange={(file) => handleFileChange('submission', file)}
                  acceptedFileTypes="application/pdf"
                  fieldName="submission"
                />
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
    </Box>
  );
};

export default GradingPage; 