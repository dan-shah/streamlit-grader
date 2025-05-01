import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Text,
  Flex,
  Icon,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCloudUploadAlt, FaFileAlt, FaTrash } from 'react-icons/fa';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string;
  fieldName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  acceptedFileTypes = "",
  fieldName,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.500', 'gray.400');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileChange(selectedFile);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? { [acceptedFileTypes]: [] } : undefined,
    maxFiles: 1,
  });

  const handleClearFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <Box width="100%">
      {!file ? (
        <Box
          {...getRootProps()}
          p={4}
          border="2px dashed"
          borderColor={isDragActive ? 'brand.500' : borderColor}
          borderRadius="md"
          bg={bgColor}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'brand.400' }}
        >
          <input {...getInputProps()} />
          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            py={4}
          >
            <Icon
              as={FaCloudUploadAlt}
              w={10}
              h={10}
              color={isDragActive ? 'brand.500' : textColor}
              mb={2}
            />
            {isDragActive ? (
              <Text color="brand.500" fontWeight="medium">
                Drop the file here...
              </Text>
            ) : (
              <>
                <Text fontWeight="medium">
                  Drag & drop a file here, or click to select
                </Text>
                <Text fontSize="sm" color={textColor} mt={1}>
                  {acceptedFileTypes === 'application/pdf'
                    ? 'Only PDF files are accepted'
                    : 'Only documents are accepted'}
                </Text>
              </>
            )}
          </Flex>
        </Box>
      ) : (
        <Flex
          p={4}
          borderRadius="md"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          align="center"
          justify="space-between"
        >
          <Flex align="center">
            <Icon as={FaFileAlt} mr={3} color="brand.500" />
            <Box>
              <Text fontWeight="medium" isTruncated maxW="200px">
                {file.name}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {(file.size / 1024).toFixed(2)} KB
              </Text>
            </Box>
          </Flex>
          <Flex align="center">
            <Badge colorScheme="brand" mr={2}>
              {file.type}
            </Badge>
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={handleClearFile}
              aria-label="Remove file"
            >
              <Icon as={FaTrash} />
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default FileUpload; 