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
    Textarea,
    VStack,
    HStack,
    Box,
    useToast,
    Text,
    InputGroup,
    InputLeftElement,
    Divider
} from '@chakra-ui/react';
import {  PhoneIcon, EmailIcon } from '@chakra-ui/icons';
import { Icon } from "@chakra-ui/react";
import { FaUser, FaIndustry, FaLightbulb } from "react-icons/fa"; // Font Awesome icon
import supplierService from '../services/supplierService';

const AddSupplierModal = ({ isOpen, onClose, onSupplierAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const toast = useToast();

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

        setLoading(true);
        try {
            const response = await supplierService.createSupplier(formData);
            
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Supplier added successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    address: ''
                });
                setErrors({});
                
                // Notify parent component
                onSupplierAdded();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to add supplier",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add supplier",
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
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
        onClose();
    };

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
                            <FaIndustry size="24px" color="white" />
                        </Box>
                        Add New Supplier
                    </ModalHeader>
                    <ModalCloseButton color="white" size="lg" top={4} right={4} />
                </Box>

                <form onSubmit={handleSubmit}>
                    <ModalBody px={8} py={8}>
                        <VStack spacing={6} align="stretch">
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

                            {/* Helper Text */}
                            <Box
                                bg="blue.50"
                                p={4}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="blue.200"
                            >
                                <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                    <FaLightbulb style={{ display: 'inline', marginRight: '8px' }} /> <strong>Tip:</strong> Ensure all supplier information is accurate for smooth business operations and communication.
                                </Text>
                            </Box>
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
                                colorScheme="secondary"
                                size="lg"
                                borderRadius="xl"
                                px={8}
                                isLoading={loading}
                                loadingText="Adding Supplier..."
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 25px rgba(237, 137, 54, 0.4)"
                                }}
                                boxShadow="0 5px 15px rgba(237, 137, 54, 0.3)"
                                fontWeight="bold"
                            >
                                Add Supplier
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default AddSupplierModal;