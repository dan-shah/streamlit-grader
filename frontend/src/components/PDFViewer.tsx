import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Button,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, title, isOpen, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const bgColor = useColorModeValue('white', 'gray.800');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} maxW="90vw" h="90vh">
        <ModalHeader>{title || 'PDF Viewer'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflow="hidden">
          <VStack h="full" spacing={4}>
            <Box flex="1" overflow="auto" w="full">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <Box p={4}>
                    <Text>Loading PDF...</Text>
                  </Box>
                }
                error={
                  <Box p={4}>
                    <Text color="red.500">Failed to load PDF.</Text>
                  </Box>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.8, 800)}
                  loading={
                    <Box p={4}>
                      <Text>Loading page...</Text>
                    </Box>
                  }
                />
              </Document>
            </Box>
            
            <HStack spacing={4} py={4}>
              <Button
                onClick={previousPage}
                isDisabled={pageNumber <= 1}
                leftIcon={<FaChevronLeft />}
              >
                Previous
              </Button>
              <Text>
                Page {pageNumber} of {numPages}
              </Text>
              <Button
                onClick={nextPage}
                isDisabled={numPages === null || pageNumber >= numPages}
                rightIcon={<FaChevronRight />}
              >
                Next
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PDFViewer; 