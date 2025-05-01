import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Badge,
  Grid,
  GridItem,
  Stack,
  HStack,
  Button,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FaCheck, FaMinus, FaArrowRight, FaDownload } from 'react-icons/fa';
import { GradingFeedback } from '../types/grading';
import { calculateTotalScore } from '../services/gradingService';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [result, setResult] = useState<GradingFeedback | null>(null);
  const [scoreDetails, setScoreDetails] = useState<{
    calculatedScore: number;
    reportedScore: number;
    discrepancy: boolean;
    totalDeductions: number;
  } | null>(null);

  useEffect(() => {
    // For demonstration purposes, we're loading from localStorage
    // In a real app, you'd fetch from an API based on the ID
    try {
      const storedResult = localStorage.getItem('gradingResult');
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult) as GradingFeedback;
        setResult(parsedResult);
        
        // Calculate score details
        if (parsedResult) {
          calculateTotalScore(parsedResult)
            .then(details => setScoreDetails(details))
            .catch(err => {
              console.error('Error calculating score:', err);
              toast({
                title: 'Error',
                description: 'Failed to calculate score details',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            });
        }
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load grading results',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [id, toast]);

  const handleDownloadPDF = () => {
    // PDF export functionality would be implemented here
    toast({
      title: 'Feature Coming Soon',
      description: 'PDF download will be available in a future update',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDownloadDocx = () => {
    // DOCX export functionality would be implemented here
    toast({
      title: 'Feature Coming Soon',
      description: 'Word document download will be available in a future update',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!result) {
    return (
      <Box textAlign="center" py={10}>
        <Heading mb={6}>No Results Found</Heading>
        <Text mb={6}>We couldn't find any grading results for this session.</Text>
        <Button colorScheme="brand" onClick={() => navigate('/grading')}>
          Go to Grading
        </Button>
      </Box>
    );
  }

  const scoreToUse = scoreDetails?.calculatedScore ?? result.numerical_grade;
  const backgroundColor = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Grading Results</Heading>
        <HStack>
          <Button leftIcon={<FaDownload />} onClick={handleDownloadPDF} variant="outline">
            PDF
          </Button>
          <Button leftIcon={<FaDownload />} onClick={handleDownloadDocx} variant="outline">
            DOCX
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
        <GridItem>
          <Box p={6} bg={backgroundColor} rounded="md" shadow="md" borderWidth="1px">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="lg">Grade</Heading>
              <Badge
                fontSize="2xl"
                px={3}
                py={1}
                colorScheme={scoreToUse >= 90 ? 'green' : scoreToUse >= 70 ? 'yellow' : 'red'}
                variant="solid"
                rounded="md"
              >
                {scoreToUse}/100
              </Badge>
            </Flex>
            
            {scoreDetails?.discrepancy && (
              <Box mb={4} p={3} bg="yellow.50" rounded="md" borderWidth="1px" borderColor="yellow.300">
                <Text fontWeight="medium" color="yellow.800">
                  Note: There was a discrepancy in score calculation. The displayed score has been adjusted.
                </Text>
              </Box>
            )}
            
            <Divider mb={4} />
            
            <Heading size="md" mb={3}>Overall Assessment</Heading>
            <Text mb={6}>{result.overall_assessment}</Text>
            
            <Heading size="md" mb={3}>Strengths</Heading>
            <List spacing={2} mb={6}>
              {result.strengths.map((strength, index) => (
                <ListItem key={index} display="flex">
                  <ListIcon as={FaCheck} color="green.500" mt={1} />
                  <Text>{strength}</Text>
                </ListItem>
              ))}
            </List>
          </Box>
        </GridItem>

        <GridItem>
          <Box p={6} bg={backgroundColor} rounded="md" shadow="md" borderWidth="1px">
            <Heading size="md" mb={4}>Point Deductions</Heading>
            
            <Stack spacing={4} mb={6}>
              {result.point_deductions.map((deduction, index) => (
                <Box key={index} p={3} bg="red.50" rounded="md" borderWidth="1px" borderColor="red.200">
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold">{deduction.area}</Text>
                    <Badge colorScheme="red">-{deduction.points} points</Badge>
                  </HStack>
                  <Text>{deduction.reason}</Text>
                </Box>
              ))}
            </Stack>
            
            <Divider mb={4} />
            
            <Heading size="md" mb={4}>Grade Calculation</Heading>
            <HStack justify="space-between" mb={2}>
              <Text>Starting Points:</Text>
              <Text fontWeight="medium">100</Text>
            </HStack>
            <HStack justify="space-between" mb={2}>
              <Text>Total Deductions:</Text>
              <Text fontWeight="medium" color="red.500">
                -{scoreDetails?.totalDeductions ?? 0}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="bold">Final Score:</Text>
              <Text fontWeight="bold" fontSize="lg">
                {scoreToUse}
              </Text>
            </HStack>
          </Box>
          
          <Box mt={4} p={6} bg={backgroundColor} rounded="md" shadow="md" borderWidth="1px">
            <Heading size="md" mb={4}>Improvement Suggestions</Heading>
            
            <Stack spacing={4}>
              {result.concept_improvements.map((improvement, index) => (
                <Box key={index} p={3} bg="blue.50" rounded="md" borderWidth="1px" borderColor="blue.200">
                  <Text fontWeight="bold" mb={1}>{improvement.concept}</Text>
                  <HStack align="flex-start" spacing={2}>
                    <Box mt={1}>
                      <FaArrowRight size={12} color="#4299E1" />
                    </Box>
                    <Text>{improvement.suggestion}</Text>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ResultsPage; 