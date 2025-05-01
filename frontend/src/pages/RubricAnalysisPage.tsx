import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
} from '@chakra-ui/react';
import FileUpload from '../components/FileUpload';
import { analyzeRubric } from '../services/rubricService';
import { RubricAnalysisResponse } from '../types/rubric';

interface FormData {
  apiKey: string;
  assignment: File | null;
}

const RubricAnalysisPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    apiKey: '',
    assignment: null,
  });
  const [analysisResult, setAnalysisResult] = useState<RubricAnalysisResponse | null>(null);
  
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.assignment) {
      toast({
        title: 'Assignment Required',
        description: 'Please upload an assignment PDF',
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

      const result = await analyzeRubric(formPayload);
      setAnalysisResult(result);
      
      toast({
        title: 'Analysis Completed',
        description: 'Rubric has been successfully analyzed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error analyzing rubric:', error);
      toast({
        title: 'Error Analyzing Rubric',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading mb={6}>Analyze Rubric</Heading>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={6} mb={8}>
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
          
          <FormControl isRequired>
            <FormLabel>Assignment & Rubric</FormLabel>
            <FileUpload
              onFileChange={(file) => handleFileChange('assignment', file)}
              acceptedFileTypes="application/pdf"
              fieldName="assignment"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            isLoading={isLoading}
            loadingText="Analyzing..."
          >
            Analyze Rubric
          </Button>
        </Stack>
      </form>

      {analysisResult && (
        <Box mt={8}>
          <Heading size="md" mb={4}>Analysis Results</Heading>
          
          <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>Improvement Recommendations</Tab>
              <Tab>Grading Advice</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Box p={4} bg="white" rounded="md" shadow="sm" borderWidth="1px">
                  <Text whiteSpace="pre-wrap">{analysisResult.improvements}</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="white" rounded="md" shadow="sm" borderWidth="1px">
                  <Text whiteSpace="pre-wrap">{analysisResult.advice}</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default RubricAnalysisPage; 