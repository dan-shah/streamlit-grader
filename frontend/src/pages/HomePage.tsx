import React from 'react';
import { Box, Heading, Text, Button, Flex, SimpleGrid, Icon, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGraduationCap, FaClipboardCheck, FaChartBar } from 'react-icons/fa';

const Feature: React.FC<{ title: string; text: string; icon: any }> = ({ title, text, icon }) => {
  return (
    <VStack
      p={5}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="md"
      shadow="md"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      align="start"
      spacing={4}
    >
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        rounded="full"
        bg="brand.500"
        color="white"
      >
        <Icon as={icon} w={6} h={6} />
      </Flex>
      <Box>
        <Heading size="md" mb={2}>
          {title}
        </Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
      </Box>
    </VStack>
  );
};

const HomePage: React.FC = () => {
  return (
    <Box>
      <Flex
        py={20}
        direction="column"
        align="center"
        textAlign="center"
        bg={useColorModeValue('brand.50', 'gray.900')}
        rounded="lg"
        mb={10}
      >
        <Heading
          as="h1"
          size="2xl"
          fontWeight="bold"
          color={useColorModeValue('brand.600', 'brand.300')}
          mb={4}
        >
          AI Assignment Grader
        </Heading>
        <Text fontSize="xl" maxW="3xl" mb={8}>
          Automatically grade assignments using Google's Generative AI. Analyze rubrics, provide detailed feedback, and ensure consistent grading.
        </Text>
        <Button
          as={RouterLink}
          to="/grading"
          size="lg"
          colorScheme="brand"
          fontWeight="bold"
          rounded="full"
          px={8}
        >
          Start Grading
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
        <Feature
          icon={FaGraduationCap}
          title="AI-Powered Grading"
          text="Grade assignments quickly and consistently using Google's Gemini AI with structured feedback and detailed explanations."
        />
        <Feature
          icon={FaClipboardCheck}
          title="Rubric Analysis"
          text="Analyze assignment rubrics to get improvement recommendations and specific advice for consistent grading."
        />
        <Feature
          icon={FaChartBar}
          title="Detailed Feedback"
          text="Provide students with clear strengths, areas for improvement, and concept-specific suggestions for better understanding."
        />
      </SimpleGrid>
    </Box>
  );
};

export default HomePage; 