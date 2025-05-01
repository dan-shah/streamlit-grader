import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GradingPage from './pages/GradingPage';
import RubricAnalysisPage from './pages/RubricAnalysisPage';
import ResultsPage from './pages/ResultsPage';

const App: React.FC = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box as="main" p={4} maxW="1200px" mx="auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grading" element={<GradingPage />} />
          <Route path="/rubric-analysis" element={<RubricAnalysisPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App; 