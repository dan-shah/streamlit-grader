import React from 'react';
import { Box, Flex, Text, Button, Stack, Link, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NavbarLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
  >
    {children}
  </Link>
);

const Navbar: React.FC = () => {
  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            AI Assignment Grader
          </Text>
        </Box>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={4}>
            <NavbarLink to="/">Home</NavbarLink>
            <NavbarLink to="/grading">Grade Assignments</NavbarLink>
            <NavbarLink to="/rubric-analysis">Analyze Rubric</NavbarLink>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 