import React, { useState, useEffect } from 'react';
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
    useToast,
    FormErrorMessage,
    Textarea,
    HStack,
    Icon,
    Box,
    Text,
    Badge,
    InputGroup,
    InputLeftElement,
    Divider,
    Flex,
    Spacer
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, PhoneIcon, EmailIcon, CalendarIcon } from '@chakra-ui/icons';
import { FaUser, FaUsers, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import customerService from '../services/customerService';

const EditCustomerModal = ({ isOpen, onClose, customer, onCustomerUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const toast = useToast();

    // Populate form when customer changes OR when modal opens
    useEffect(() => {
        if (customer && isOpen) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
            setHasChanges(false);
            setErrors({});
        }
    }, [customer, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };
            
            // Check if form has changes compared to original customer data
            const hasFormChanges = 
                updated.name !== (customer?.name || '') ||
                updated.email !== (customer?.email || '') ||
                updated.phone !== (customer?.phone || '') ||
                updated.address !== (customer?.address || '');
            
            setHasChanges(hasFormChanges);
            return updated;
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Customer name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Email validation (optional but if provided should be valid)
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'Address must be at least 5 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm() || !customer) {
            return;
        }

        setLoading(true);
        try {
            const customerData = {
                name: formData.name.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim(),
                address: formData.address.trim()
            };

            const response = await customerService.updateCustomer(customer._id, customerData);
            
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Customer updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                
                // Notify parent component
                onCustomerUpdated();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update customer",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update customer. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
            });
            setErrors({});
            setHasChanges(false);
            onClose();
        }
    };

    if (!customer) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent
                borderRadius="2xl"
                boxShadow="2xl"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                overflow="hidden"
            >
                {/* Modal Header with Gradient */}
                <Box
                    bgGradient="linear(135deg, blue.500 0%, purple.500 100%)"
                    px={6}
                    py={4}
                    color="white"
                >
                    <ModalHeader p={0} fontSize="2xl" fontWeight="bold" display="flex" alignItems="center">
                        <Box
                            w="10"
                            h="10"
                            bg="whiteAlpha.200"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mr={3}
                            backdropFilter="blur(10px)"
                            border="1px solid rgba(255,255,255,0.2)"
                        >
                            <Text fontSize="xl">✏️</Text>
                        </Box>
                        Edit Customer
                    </ModalHeader>
                    <ModalCloseButton color="white" size="lg" top={4} right={4} />
                </Box>
                
                <form onSubmit={handleSubmit}>
                    <ModalBody px={8} py={8}>
                        <VStack spacing={6} align="stretch">
                            {/* Customer Info Header */}
                            <Box
                                bg="gray.50"
                                p={4}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <Flex align="center" justify="space-between" mb={3}>
                                    <HStack spacing={3}>
                                        <Box
                                            w="8"
                                            h="8"
                                            bg="blue.100"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <FaUsers size="18px" color="var(--chakra-colors-blue-600)" />
                                        </Box>
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                                {customer.name}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Customer ID: {customer._id?.slice(-8)}
                                            </Text>
                                        </Box>
                                    </HStack>
                                    <Badge colorScheme="blue" size="lg" borderRadius="full" px={3} py={1}>
                                        Active Customer
                                    </Badge>
                                </Flex>
                                
                                <HStack spacing={4} fontSize="sm" color="gray.600">
                                    <HStack spacing={1}>
                                        <CalendarIcon />
                                        <Text fontWeight="medium">
                                            Added: {new Date(customer.createdAt).toLocaleDateString()}
                                        </Text>
                                    </HStack>
                                    {hasChanges && (
                                        <Badge colorScheme="orange" size="sm" borderRadius="full">
                                            Changes Pending
                                        </Badge>
                                    )}
                                </HStack>
                            </Box>

                            {/* Customer Name */}
                            <FormControl isInvalid={errors.name}>
                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                                    Customer Name *
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none" h="full">
                                        <Icon as={FaUser} color="brand.500" />
                                    </InputLeftElement>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter customer's full name"
                                        borderRadius="xl"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        focusBorderColor="blue.500"
                                        _hover={{ borderColor: 'blue.300' }}
                                        bg="white"
                                        fontSize="md"
                                    />
                                </InputGroup>
                                {errors.name && (
                                    <Text color="red.500" fontSize="sm" mt={2}>
                                        {errors.name}
                                    </Text>
                                )}
                            </FormControl>

                            <HStack spacing={4} align="start">
                                {/* Phone Number */}
                                <FormControl isInvalid={errors.phone}>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                                        Phone Number *
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        <InputLeftElement pointerEvents="none" h="full">
                                            <PhoneIcon color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            focusBorderColor="blue.500"
                                            _hover={{ borderColor: 'blue.300' }}
                                            bg="white"
                                            fontSize="md"
                                        />
                                    </InputGroup>
                                    {errors.phone && (
                                        <Text color="red.500" fontSize="sm" mt={2}>
                                            {errors.phone}
                                        </Text>
                                    )}
                                </FormControl>

                                {/* Email Address */}
                                <FormControl isInvalid={errors.email}>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                                        Email Address
                                    </FormLabel>
                                    <InputGroup size="lg">
                                        <InputLeftElement pointerEvents="none" h="full">
                                            <EmailIcon color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email (optional)"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            focusBorderColor="blue.500"
                                            _hover={{ borderColor: 'blue.300' }}
                                            bg="white"
                                            fontSize="md"
                                        />
                                    </InputGroup>
                                    {errors.email && (
                                        <Text color="red.500" fontSize="sm" mt={2}>
                                            {errors.email}
                                        </Text>
                                    )}
                                </FormControl>
                            </HStack>

                            <Divider borderColor="gray.200" />

                            {/* Address */}
                            <FormControl isInvalid={errors.address}>
                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                                    Customer Address *
                                </FormLabel>
                                <Textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter complete address including city, state, and postal code"
                                    rows={4}
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="blue.500"
                                    _hover={{ borderColor: 'blue.300' }}
                                    bg="white"
                                    fontSize="md"
                                    resize="vertical"
                                />
                                {errors.address && (
                                    <Text color="red.500" fontSize="sm" mt={2}>
                                        {errors.address}
                                    </Text>
                                )}
                            </FormControl>

                            {/* Status Message */}
                            {hasChanges ? (
                                <Box
                                    bg="orange.50"
                                    p={4}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="orange.200"
                                >
                                    <Text fontSize="sm" color="orange.700" fontWeight="medium">
                                        <FaExclamationTriangle style={{ display: 'inline', marginRight: '8px' }} /> <strong>Changes Detected:</strong> Click "Update Customer" to save your changes.
                                    </Text>
                                </Box>
                            ) : (
                                <Box
                                    bg="blue.50"
                                    p={4}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="blue.200"
                                >
                                    <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                        <FaCheckCircle style={{ display: 'inline', marginRight: '8px' }} /> <strong>No Changes:</strong> All fields match the current customer information.
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={8} py={6} bg="gray.50">
                        <HStack spacing={4} width="full" justify="end">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                size="lg"
                                borderRadius="xl"
                                borderWidth="2px"
                                colorScheme="gray"
                                px={8}
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
                                size="lg"
                                borderRadius="xl"
                                px={8}
                                isLoading={loading}
                                loadingText="Updating..."
                                isDisabled={!hasChanges}
                                _hover={{
                                    transform: hasChanges ? "translateY(-2px)" : "none",
                                    boxShadow: hasChanges ? "0 10px 25px rgba(54, 130, 216, 0.4)" : "none"
                                }}
                                boxShadow={hasChanges ? "0 5px 15px rgba(54, 130, 216, 0.3)" : "none"}
                                fontWeight="bold"
                                opacity={hasChanges ? 1 : 0.6}
                            >
                                Update Customer
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default EditCustomerModal;