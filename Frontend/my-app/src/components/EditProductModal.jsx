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
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    VStack,
    HStack,
    Box,
    Text,
    useToast,
    Divider,
    Badge,
    useDisclosure,
    InputGroup,
    InputLeftElement,
    IconButton,
    Tooltip,
    Flex,
    FormErrorMessage,
    Switch,
    Spacer,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription
} from '@chakra-ui/react';
import { 
    EditIcon, 
    CalendarIcon,
    InfoIcon,
    CheckCircleIcon,
    WarningIcon
} from '@chakra-ui/icons';
import { FaBoxes, FaDollarSign, FaCog } from 'react-icons/fa';
import productService from '../services/productService';
import AddCategoryModal from './AddCategoryModal';
import ReactSelect from 'react-select';

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated, suppliers, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: 0,
        category: '',
        batchName: '',
        price: 0,
        discount: 0,
        supplier: '',
        status: 'active',
        expiryDate: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [hasExpiryDate, setHasExpiryDate] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    const toast = useToast();
    const { isOpen: isAddCategoryOpen, onOpen: onAddCategoryOpen, onClose: onAddCategoryClose } = useDisclosure();

    // Convert suppliers and categories to react-select format
    useEffect(() => {
        if (suppliers) {
            const options = suppliers.map(supplier => ({
                value: supplier._id,
                label: supplier.name,
                supplier: supplier
            }));
            setSupplierOptions(options);
        }
    }, [suppliers]);

    useEffect(() => {
        if (categories) {
            const options = categories.map(category => ({
                value: category,
                label: category
            }));
            setCategoryOptions(options);
        }
    }, [categories]);

    // Populate form when product changes
    useEffect(() => {
        if (product && isOpen) {
            const productData = {
                name: product.name || '',
                description: product.description || '',
                quantity: product.quantity || 0,
                category: product.category || '',
                batchName: product.batchName || '',
                price: product.price || 0,
                discount: product.discount || 0,
                supplier: product.supplier?._id || '',
                status: product.status || 'active',
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
            };
            
            setFormData(productData);
            setOriginalData(productData);
            setHasExpiryDate(!!product.expiryDate);
            setHasChanges(false);
        }
    }, [product, isOpen]);

    // Check for changes
    useEffect(() => {
        if (Object.keys(originalData).length > 0) {
            const changed = Object.keys(formData).some(key => {
                if (key === 'expiryDate') {
                    // Handle expiry date comparison
                    const originalHasExpiry = !!originalData[key];
                    const currentHasExpiry = hasExpiryDate && !!formData[key];
                    return originalHasExpiry !== currentHasExpiry || 
                           (originalHasExpiry && currentHasExpiry && originalData[key] !== formData[key]);
                }
                return originalData[key] !== formData[key];
            });
            setHasChanges(changed || hasExpiryDate !== !!originalData.expiryDate);
        }
    }, [formData, originalData, hasExpiryDate]);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                name: '',
                description: '',
                quantity: 0,
                category: '',
                batchName: '',
                price: 0,
                discount: 0,
                supplier: '',
                status: 'active',
                expiryDate: ''
            });
            setOriginalData({});
            setErrors({});
            setHasExpiryDate(false);
            setHasChanges(false);
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (formData.quantity < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }
        
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        
        if (!formData.batchName.trim()) {
            newErrors.batchName = 'Batch name is required';
        }
        
        if (formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }
        
        if (formData.discount < 0 || formData.discount > 100) {
            newErrors.discount = 'Discount must be between 0 and 100';
        }
        
        if (!formData.supplier) {
            newErrors.supplier = 'Supplier is required';
        }

        if (hasExpiryDate && formData.expiryDate) {
            const expiryDate = new Date(formData.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (expiryDate <= today) {
                newErrors.expiryDate = 'Expiry date must be in the future';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (!hasChanges) {
            toast({
                title: "No Changes",
                description: "No changes were made to the product",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        setLoading(true);
        
        try {
            const submitData = {
                ...formData,
                expiryDate: hasExpiryDate && formData.expiryDate ? formData.expiryDate : undefined
            };
            
            const response = await productService.updateProduct(product._id, submitData);
            
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Product updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onProductUpdated();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update product",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update product",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryAdded = (newCategory) => {
        const newOption = { value: newCategory, label: newCategory };
        setCategoryOptions(prev => [...prev, newOption]);
        handleInputChange('category', newCategory);
        onAddCategoryClose();
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderRadius: '12px',
            borderWidth: '2px',
            borderColor: state.isFocused ? '#805AD5' : '#E2E8F0',
            backgroundColor: 'white',
            minHeight: '48px',
            boxShadow: state.isFocused ? '0 0 0 1px #805AD5' : 'none',
            '&:hover': {
                borderColor: '#805AD5'
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '12px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 9999
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#805AD5' : state.isFocused ? '#F7FAFC' : 'white',
            color: state.isSelected ? 'white' : '#2D3748',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: state.isSelected ? '#805AD5' : '#EDF2F7'
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: '#A0AEC0'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#2D3748'
        })
    };

    const finalPrice = formData.price - (formData.price * formData.discount / 100);

    if (!product) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
                <ModalContent borderRadius="2xl" boxShadow="2xl" maxW="600px">
                    {/* Header */}
                    <Box
                        bgGradient="linear(135deg, green.500 0%, teal.500 100%)"
                        color="white"
                        px={8}
                        py={6}
                        borderRadius="2xl 2xl 0 0"
                    >
                        <HStack spacing={3}>
                            <Box
                                w="12"
                                h="12"
                                bg="whiteAlpha.200"
                                borderRadius="xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                backdropFilter="blur(10px)"
                            >
                                <EditIcon w="6" h="6" />
                            </Box>
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold">
                                    Edit Product
                                </Text>
                                <Text color="whiteAlpha.900" fontSize="md">
                                    Update product information
                                </Text>
                            </Box>
                        </HStack>
                    </Box>
                    
                    <ModalCloseButton color="white" size="lg" />
                    
                    <form onSubmit={handleSubmit}>
                        <ModalBody px={8} py={6}>
                            <VStack spacing={6} align="stretch">
                                {/* Changes Alert */}
                                {hasChanges && (
                                    <Alert status="info" borderRadius="xl" bg="blue.50" border="2px solid" borderColor="blue.200">
                                        <AlertIcon color="blue.500" />
                                        <Box>
                                            <AlertTitle color="blue.700">Changes Detected!</AlertTitle>
                                            <AlertDescription color="blue.600" fontSize="sm">
                                                You have unsaved changes to this product.
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                )}

                                {/* Basic Information Section */}
                                <Box>
                                    <HStack spacing={2} mb={4}>
                                        <InfoIcon color="green.500" />
                                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                            Basic Information
                                        </Text>
                                    </HStack>
                                    
                                    <VStack spacing={4} align="stretch">
                                        {/* Product Name */}
                                        <FormControl isInvalid={errors.name}>
                                            <FormLabel fontWeight="semibold" color="gray.700">
                                                Product Name *
                                            </FormLabel>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Enter product name"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                focusBorderColor="green.500"
                                                _hover={{ borderColor: 'green.300' }}
                                                size="lg"
                                            />
                                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                                        </FormControl>

                                        {/* Description */}
                                        <FormControl isInvalid={errors.description}>
                                            <FormLabel fontWeight="semibold" color="gray.700">
                                                Description *
                                            </FormLabel>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Enter product description"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                focusBorderColor="green.500"
                                                _hover={{ borderColor: 'green.300' }}
                                                rows={3}
                                                resize="vertical"
                                            />
                                            <FormErrorMessage>{errors.description}</FormErrorMessage>
                                        </FormControl>

                                        {/* Category with Add Option */}
                                        <FormControl isInvalid={errors.category}>
                                            <FormLabel fontWeight="semibold" color="gray.700">
                                                Category *
                                            </FormLabel>
                                            <HStack spacing={2}>
                                                <Box flex="1">
                                                    <ReactSelect
                                                        value={categoryOptions.find(option => option.value === formData.category)}
                                                        onChange={(option) => handleInputChange('category', option?.value || '')}
                                                        options={categoryOptions}
                                                        placeholder="Select or search category..."
                                                        isSearchable
                                                        isClearable
                                                        styles={selectStyles}
                                                        noOptionsMessage={() => "No categories found"}
                                                    />
                                                </Box>
                                                <Tooltip label="Add New Category">
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        onClick={onAddCategoryOpen}
                                                        colorScheme="green"
                                                        size="lg"
                                                        borderRadius="xl"
                                                        _hover={{
                                                            transform: "scale(1.05)"
                                                        }}
                                                    />
                                                </Tooltip>
                                            </HStack>
                                            <FormErrorMessage>{errors.category}</FormErrorMessage>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                <Divider />

                                {/* Inventory Details Section */}
                                <Box>
                                    <HStack spacing={2} mb={4}>
                                        <FaBoxes size="24px" color="var(--chakra-colors-gray-700)" />
                                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                            Inventory Details
                                        </Text>
                                    </HStack>
                                    
                                    <VStack spacing={4} align="stretch">
                                        {/* Batch Name and Quantity */}
                                        <HStack spacing={4}>
                                            <FormControl isInvalid={errors.batchName} flex="1">
                                                <FormLabel fontWeight="semibold" color="gray.700">
                                                    Batch Name *
                                                </FormLabel>
                                                <Input
                                                    value={formData.batchName}
                                                    onChange={(e) => handleInputChange('batchName', e.target.value)}
                                                    placeholder="Enter batch name"
                                                    borderRadius="xl"
                                                    border="2px solid"
                                                    borderColor="gray.200"
                                                    focusBorderColor="green.500"
                                                    _hover={{ borderColor: 'green.300' }}
                                                    size="lg"
                                                />
                                                <FormErrorMessage>{errors.batchName}</FormErrorMessage>
                                            </FormControl>

                                            <FormControl isInvalid={errors.quantity} flex="1">
                                                <FormLabel fontWeight="semibold" color="gray.700">
                                                    Quantity *
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.quantity}
                                                    onChange={(value) => handleInputChange('quantity', Number(value))}
                                                    min={0}
                                                >
                                                    <NumberInputField
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        focusBorderColor="green.500"
                                                        _hover={{ borderColor: 'green.300' }}
                                                        size="lg"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                                <FormErrorMessage>{errors.quantity}</FormErrorMessage>
                                            </FormControl>
                                        </HStack>

                                        {/* Supplier */}
                                        <FormControl isInvalid={errors.supplier}>
                                            <FormLabel fontWeight="semibold" color="gray.700">
                                                Supplier *
                                            </FormLabel>
                                            <ReactSelect
                                                value={supplierOptions.find(option => option.value === formData.supplier)}
                                                onChange={(option) => handleInputChange('supplier', option?.value || '')}
                                                options={supplierOptions}
                                                placeholder="Select or search supplier..."
                                                isSearchable
                                                isClearable
                                                styles={selectStyles}
                                                noOptionsMessage={() => "No suppliers found"}
                                                formatOptionLabel={(option) => (
                                                    <Box>
                                                        <Text fontWeight="semibold">{option.label}</Text>
                                                        {option.supplier && (
                                                            <Text fontSize="sm" color="gray.500">
                                                                {option.supplier.email} • {option.supplier.phone}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                )}
                                            />
                                            <FormErrorMessage>{errors.supplier}</FormErrorMessage>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                <Divider />

                                {/* Pricing Section */}
                                <Box>
                                    <HStack spacing={2} mb={4}>
                                        <FaDollarSign size="24px" color="var(--chakra-colors-gray-700)" />
                                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                            Pricing Information
                                        </Text>
                                    </HStack>
                                    
                                    <VStack spacing={4} align="stretch">
                                        <HStack spacing={4}>
                                            <FormControl isInvalid={errors.price} flex="1">
                                                <FormLabel fontWeight="semibold" color="gray.700">
                                                    Price *
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement
                                                        pointerEvents="none"
                                                        color="gray.500"
                                                        fontSize="lg"
                                                        h="full"
                                                    >
                                                        $
                                                    </InputLeftElement>
                                                    <NumberInput
                                                        value={formData.price}
                                                        onChange={(value) => handleInputChange('price', Number(value))}
                                                        min={0}
                                                        precision={2}
                                                        w="full"
                                                    >
                                                        <NumberInputField
                                                            pl="10"
                                                            borderRadius="xl"
                                                            border="2px solid"
                                                            borderColor="gray.200"
                                                            focusBorderColor="green.500"
                                                            _hover={{ borderColor: 'green.300' }}
                                                            size="lg"
                                                        />
                                                    </NumberInput>
                                                </InputGroup>
                                                <FormErrorMessage>{errors.price}</FormErrorMessage>
                                            </FormControl>

                                            <FormControl isInvalid={errors.discount} flex="1">
                                                <FormLabel fontWeight="semibold" color="gray.700">
                                                    Discount (%)
                                                </FormLabel>
                                                <NumberInput
                                                    value={formData.discount}
                                                    onChange={(value) => handleInputChange('discount', Number(value))}
                                                    min={0}
                                                    max={100}
                                                >
                                                    <NumberInputField
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        focusBorderColor="green.500"
                                                        _hover={{ borderColor: 'green.300' }}
                                                        size="lg"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                                <FormErrorMessage>{errors.discount}</FormErrorMessage>
                                            </FormControl>
                                        </HStack>

                                        {/* Final Price Display */}
                                        {formData.price > 0 && (
                                            <Box
                                                bg="green.50"
                                                p={4}
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="green.200"
                                            >
                                                <HStack justify="space-between">
                                                    <Text fontSize="lg" fontWeight="semibold" color="green.700">
                                                        Final Price:
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        {formData.discount > 0 && (
                                                            <Text
                                                                fontSize="md"
                                                                color="gray.500"
                                                                textDecoration="line-through"
                                                            >
                                                                ${formData.price.toFixed(2)}
                                                            </Text>
                                                        )}
                                                        <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                                            ${finalPrice.toFixed(2)}
                                                        </Text>
                                                        {formData.discount > 0 && (
                                                            <Badge colorScheme="red" fontSize="sm">
                                                                -{formData.discount}%
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                </HStack>
                                            </Box>
                                        )}
                                    </VStack>
                                </Box>

                                <Divider />

                                {/* Additional Settings */}
                                <Box>
                                    <HStack spacing={2} mb={4}>
                                        <FaCog size="24px" color="var(--chakra-colors-gray-700)" />
                                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                            Additional Settings
                                        </Text>
                                    </HStack>
                                    
                                    <VStack spacing={4} align="stretch">
                                        {/* Status */}
                                        <FormControl>
                                            <FormLabel fontWeight="semibold" color="gray.700">
                                                Status
                                            </FormLabel>
                                            <Select
                                                value={formData.status}
                                                onChange={(e) => handleInputChange('status', e.target.value)}
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                focusBorderColor="green.500"
                                                _hover={{ borderColor: 'green.300' }}
                                                size="lg"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="discontinued">Discontinued</option>
                                                <option value="out-of-stock">Out of Stock</option>
                                            </Select>
                                        </FormControl>

                                        {/* Expiry Date Toggle */}
                                        <FormControl>
                                            <Flex align="center">
                                                <FormLabel fontWeight="semibold" color="gray.700" mb={0}>
                                                    Has Expiry Date
                                                </FormLabel>
                                                <Spacer />
                                                <Switch
                                                    isChecked={hasExpiryDate}
                                                    onChange={(e) => setHasExpiryDate(e.target.checked)}
                                                    colorScheme="green"
                                                    size="lg"
                                                />
                                            </Flex>
                                        </FormControl>

                                        {/* Expiry Date */}
                                        {hasExpiryDate && (
                                            <FormControl isInvalid={errors.expiryDate}>
                                                <FormLabel fontWeight="semibold" color="gray.700">
                                                    Expiry Date
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement
                                                        pointerEvents="none"
                                                        h="full"
                                                    >
                                                        <CalendarIcon color="gray.400" />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="date"
                                                        value={formData.expiryDate}
                                                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        focusBorderColor="green.500"
                                                        _hover={{ borderColor: 'green.300' }}
                                                        size="lg"
                                                        pl="12"
                                                    />
                                                </InputGroup>
                                                <FormErrorMessage>{errors.expiryDate}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        </ModalBody>

                        <Box px={8} py={6} bg="gray.50" borderRadius="0 0 2xl 2xl">
                            <HStack spacing={4} justify="end">
                                <Button 
                                    onClick={onClose}
                                    variant="outline"
                                    size="lg"
                                    borderRadius="xl"
                                    borderWidth="2px"
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
                                    colorScheme="green"
                                    size="lg"
                                    borderRadius="xl"
                                    px={8}
                                    isLoading={loading}
                                    isDisabled={!hasChanges}
                                    loadingText="Updating Product..."
                                    leftIcon={<CheckCircleIcon />}
                                    _hover={{
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 10px 25px rgba(72, 187, 120, 0.4)"
                                    }}
                                    boxShadow="0 5px 15px rgba(72, 187, 120, 0.3)"
                                >
                                    Update Product
                                </Button>
                            </HStack>
                        </Box>
                    </form>
                </ModalContent>
            </Modal>

            {/* Add Category Modal */}
            <AddCategoryModal
                isOpen={isAddCategoryOpen}
                onClose={onAddCategoryClose}
                onCategoryAdded={handleCategoryAdded}
            />
        </>
    );
};

export default EditProductModal;