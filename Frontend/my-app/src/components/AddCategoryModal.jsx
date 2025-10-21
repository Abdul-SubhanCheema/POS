import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    HStack,
    Box,
    Text,
    useToast,
    FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaLightbulb } from 'react-icons/fa';
import productService from '../services/productService';

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const toast = useToast();

    const handleClose = () => {
        setCategoryName('');
        setError('');
        onClose();
    };

    const validateCategory = () => {
        if (!categoryName.trim()) {
            setError('Category name is required');
            return false;
        }
        
        if (categoryName.trim().length < 2) {
            setError('Category name must be at least 2 characters');
            return false;
        }
        
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateCategory()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // For now, we'll just add it locally since the backend doesn't have a specific category endpoint
            // In a real application, you would have a dedicated category management system
            const trimmedCategory = categoryName.trim();
            
            toast({
                title: "Success",
                description: `Category "${trimmedCategory}" added successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            onCategoryAdded(trimmedCategory);
            handleClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add category",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl" boxShadow="2xl" maxW="400px">
                {/* Header */}
                <Box
                    bgGradient="linear(135deg, blue.500 0%, teal.500 100%)"
                    color="white"
                    px={6}
                    py={4}
                    borderRadius="2xl 2xl 0 0"
                >
                    <HStack spacing={3}>
                        <Box
                            w="10"
                            h="10"
                            bg="whiteAlpha.200"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            backdropFilter="blur(10px)"
                        >
                            <AddIcon w="5" h="5" />
                        </Box>
                        <Box>
                            <Text fontSize="xl" fontWeight="bold">
                                Add New Category
                            </Text>
                            <Text color="whiteAlpha.900" fontSize="sm">
                                Create a new product category
                            </Text>
                        </Box>
                    </HStack>
                </Box>
                
                <ModalCloseButton color="white" />
                
                <form onSubmit={handleSubmit}>
                    <ModalBody px={6} py={6}>
                        <VStack spacing={4} align="stretch">
                            <FormControl isInvalid={error}>
                                <FormLabel fontWeight="semibold" color="gray.700">
                                    Category Name *
                                </FormLabel>
                                <Input
                                    value={categoryName}
                                    onChange={(e) => {
                                        setCategoryName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="Enter category name"
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="blue.500"
                                    _hover={{ borderColor: 'blue.300' }}
                                    size="lg"
                                    autoFocus
                                />
                                <FormErrorMessage>{error}</FormErrorMessage>
                            </FormControl>
                            
                            <Box
                                bg="blue.50"
                                p={4}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="blue.200"
                            >
                                <Text fontSize="sm" color="blue.700">
                                    <FaLightbulb style={{ display: 'inline', marginRight: '8px' }} /> <strong>Tip:</strong> Choose a clear, descriptive name for your category 
                                    that will help you organize your products effectively.
                                </Text>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <Box px={6} py={4} bg="gray.50" borderRadius="0 0 2xl 2xl">
                        <HStack spacing={3} justify="end">
                            <Button 
                                onClick={handleClose}
                                variant="outline"
                                borderRadius="xl"
                                _hover={{
                                    bg: "gray.100",
                                    transform: "translateY(-1px)"
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                colorScheme="blue"
                                borderRadius="xl"
                                isLoading={loading}
                                loadingText="Adding..."
                                leftIcon={<CheckCircleIcon />}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 25px rgba(66, 153, 225, 0.4)"
                                }}
                                boxShadow="0 5px 15px rgba(66, 153, 225, 0.3)"
                            >
                                Add Category
                            </Button>
                        </HStack>
                    </Box>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default AddCategoryModal;