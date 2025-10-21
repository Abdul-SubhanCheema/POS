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
    Textarea,
    VStack,
    HStack,
    Box,
    useToast,
    Text,
    InputGroup,
    InputLeftElement,
    Divider,
    Badge,
    Flex,
    Spacer
} from '@chakra-ui/react';
import {  PhoneIcon, EmailIcon, CalendarIcon } from '@chakra-ui/icons';

import { Icon } from "@chakra-ui/react";
import { FaUser, FaIndustry, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"; // Font Awesome icon
import supplierService from '../services/supplierService';

const EditSupplierModal = ({ isOpen, onClose, supplier, onSupplierUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const toast = useToast();

    // Update form data when supplier prop changes OR when modal opens
    useEffect(() => {
        if (supplier && isOpen) {
            setFormData({
                name: supplier.name || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || ''
            });
            setHasChanges(false);
            setErrors({});
        }
    }, [supplier, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Supplier name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (!hasChanges) {
            toast({
                title: "No Changes",
                description: "No changes were made to update",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await supplierService.updateSupplier(supplier._id, formData);
            
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Supplier updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                
                // Notify parent component
                onSupplierUpdated();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update supplier",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update supplier",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };
            
            // Check if form has changes compared to original supplier data
            const hasFormChanges = 
                updated.name !== (supplier?.name || '') ||
                updated.phone !== (supplier?.phone || '') ||
                updated.email !== (supplier?.email || '') ||
                updated.address !== (supplier?.address || '');
            
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

    const handleClose = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: ''
        });
        setErrors({});
        setHasChanges(false);
        onClose();
    };

    if (!supplier) {
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
                    bgGradient="linear(135deg, secondary.500 0%, orange.500 100%)"
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
                        Edit Supplier
                    </ModalHeader>
                    <ModalCloseButton color="white" size="lg" top={4} right={4} />
                </Box>

                <form onSubmit={handleSubmit}>
                    <ModalBody px={8} py={8}>
                        <VStack spacing={6} align="stretch">
                            {/* Supplier Info Header */}
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
                                            bg="orange.100"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <FaIndustry size="18px" color="var(--chakra-colors-blue-600)" />
                                        </Box>
                                        <Box>
                                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                                {supplier.name}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Supplier ID: {supplier._id?.slice(-8)}
                                            </Text>
                                        </Box>
                                    </HStack>
                                    <Badge colorScheme="orange" size="lg" borderRadius="full" px={3} py={1}>
                                        Active Supplier
                                    </Badge>
                                </Flex>
                                
                                <HStack spacing={4} fontSize="sm" color="gray.600">
                                    <HStack spacing={1}>
                                        <CalendarIcon />
                                        <Text fontWeight="medium">
                                            Added: {new Date(supplier.createdAt).toLocaleDateString()}
                                        </Text>
                                    </HStack>
                                    {hasChanges && (
                                        <Badge colorScheme="orange" size="sm" borderRadius="full">
                                            Changes Pending
                                        </Badge>
                                    )}
                                </HStack>
                            </Box>

                            {/* Supplier Name */}
                            <FormControl isInvalid={errors.name}>
                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                                    Supplier Name *
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none" h="full">
                                        <Icon as={FaUser} boxSize={6} color="secondary.500" />
                                    </InputLeftElement>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter supplier company name"
                                        borderRadius="xl"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        focusBorderColor="secondary.500"
                                        _hover={{ borderColor: 'secondary.300' }}
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
                                            <PhoneIcon color="secondary.500" />
                                        </InputLeftElement>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            focusBorderColor="secondary.500"
                                            _hover={{ borderColor: 'secondary.300' }}
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
                                            <EmailIcon color="secondary.500" />
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
                                            focusBorderColor="secondary.500"
                                            _hover={{ borderColor: 'secondary.300' }}
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
                                    Business Address *
                                </FormLabel>
                                <Textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter complete business address including city, state, and postal code"
                                    rows={4}
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="secondary.500"
                                    _hover={{ borderColor: 'secondary.300' }}
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
                                        <FaExclamationTriangle style={{ display: 'inline', marginRight: '8px' }} /> <strong>Changes Detected:</strong> Click "Update Supplier" to save your changes.
                                    </Text>
                                </Box>
                            ) : (
                                <Box
                                    bg="orange.50"
                                    p={4}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="orange.200"
                                >
                                    <Text fontSize="sm" color="orange.700" fontWeight="medium">
                                        <FaCheckCircle style={{ display: 'inline', marginRight: '8px' }} /> <strong>No Changes:</strong> All fields match the current supplier information.
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
                                colorScheme="orange"
                                size="lg"
                                borderRadius="xl"
                                px={8}
                                isLoading={loading}
                                loadingText="Updating..."
                                isDisabled={!hasChanges}
                                _hover={{
                                    transform: hasChanges ? "translateY(-2px)" : "none",
                                    boxShadow: hasChanges ? "0 10px 25px rgba(237, 137, 54, 0.4)" : "none"
                                }}
                                boxShadow={hasChanges ? "0 5px 15px rgba(237, 137, 54, 0.3)" : "none"}
                                fontWeight="bold"
                                opacity={hasChanges ? 1 : 0.6}
                            >
                                Update Supplier
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default EditSupplierModal;