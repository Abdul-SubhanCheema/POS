import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    VStack,
    HStack,
    Box,
    Text,
    useToast,
    Divider,
    Badge,
    InputGroup,
    InputLeftElement,
    FormErrorMessage,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Flex,
    Spacer,
    IconButton,
    Tooltip,
    Select
} from '@chakra-ui/react';
import { 
    AddIcon, 
    DeleteIcon,
    InfoIcon,
    CheckCircleIcon,
    WarningIcon
} from '@chakra-ui/icons';
import { FaDollarSign, FaUsers, FaShoppingBag, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import ReactSelect from 'react-select';
import customerService from '../services/customerService';
import supplierService from '../services/supplierService';
import productService from '../services/productService';
import saleService from '../services/saleService';

const ProcessSaleModal = ({ isOpen, onClose, onSaleProcessed }) => {
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [customerPriceHistory, setCustomerPriceHistory] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Payment processing state
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
    const [discountValue, setDiscountValue] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    
    const toast = useToast();

    // Fetch initial data
    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [customersRes, suppliersRes, productsRes] = await Promise.all([
                customerService.getAllActiveCustomers(),
                supplierService.getAllActiveSuppliers(),
                productService.getAllProducts()
            ]);

            if (customersRes.success) setCustomers(customersRes.data);
            if (suppliersRes.success) setSuppliers(suppliersRes.data);
            if (productsRes.success) setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "Failed to load data for sale processing",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Fetch customer price history for a specific product
    const fetchCustomerPriceHistory = async (customerId, productId) => {
        try {
            const response = await saleService.getCustomerPriceHistory(customerId, productId, 10);
            
            if (response.success && response.data) {
                const historyKey = `customer_${customerId}_product_${productId}`;
                const history = response.data.map(item => ({
                    price: item.price,
                    quantity: item.quantity,
                    date: item.saleDate,
                    totalAmount: item.totalAmount,
                    saleNumber: item.sale?.saleNumber
                }));
                
                setCustomerPriceHistory(prev => ({
                    ...prev,
                    [historyKey]: history
                }));
                return history;
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching price history:', error);
            return null;
        }
    };

    // Save customer price history (now handled by backend when creating sale)

    // Add item to sale
    const addSaleItem = () => {
        setSaleItems(prev => [...prev, {
            id: Date.now(),
            product: null,
            quantity: 1,
            unitPrice: 0,
            actualPrice: 0,
            profitPerUnit: 0,
            totalProfit: 0,
            previousPrice: null,
            total: 0
        }]);
    };

    // Remove item from sale
    const removeSaleItem = (itemId) => {
        setSaleItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Update sale item
    const updateSaleItem = async (itemId, field, value) => {
        setSaleItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };
                
                // If product is selected, set the price and fetch price history
                if (field === 'product' && value) {
                    // Set the product's actual price and base price
                    updatedItem.actualPrice = value.price;
                    updatedItem.unitPrice = value.price;
                    updatedItem.total = updatedItem.quantity * value.price;
                    
                    // Calculate initial profit (should be 0 when selling at actual price)
                    updatedItem.profitPerUnit = updatedItem.unitPrice - updatedItem.actualPrice;
                    updatedItem.totalProfit = updatedItem.profitPerUnit * updatedItem.quantity;
                    
                    // If we have a customer, fetch price history
                    if (selectedCustomer) {
                        fetchCustomerPriceHistory(selectedCustomer.value, value.value).then(history => {
                            if (history && history.length > 0) {
                                // Get the most recent price (first item since sorted by date desc)
                                const lastPrice = history[0].price;
                                setSaleItems(current => current.map(currentItem => {
                                    if (currentItem.id === itemId) {
                                        const profitPerUnit = lastPrice - currentItem.actualPrice;
                                        const totalProfit = profitPerUnit * currentItem.quantity;
                                        return { 
                                            ...currentItem, 
                                            previousPrice: lastPrice, 
                                            unitPrice: lastPrice, 
                                            total: currentItem.quantity * lastPrice,
                                            profitPerUnit: profitPerUnit,
                                            totalProfit: totalProfit
                                        };
                                    }
                                    return currentItem;
                                }));
                            } else {
                                // No history, keep the base price but clear previous price
                                setSaleItems(current => current.map(currentItem => 
                                    currentItem.id === itemId 
                                        ? { ...currentItem, previousPrice: null }
                                        : currentItem
                                ));
                            }
                        });
                    } else {
                        // No customer selected, just use base price
                        updatedItem.previousPrice = null;
                    }
                }
                
                // Calculate total and profit
                if (field === 'quantity' || field === 'unitPrice') {
                    updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
                    // Calculate profit if we have actualPrice
                    if (updatedItem.actualPrice > 0) {
                        updatedItem.profitPerUnit = updatedItem.unitPrice - updatedItem.actualPrice;
                        updatedItem.totalProfit = updatedItem.profitPerUnit * updatedItem.quantity;
                    }
                }
                
                return updatedItem;
            }
            return item;
        }));
    };

    // Calculate subtotal (before discounts and tax)
    const calculateSubtotal = () => {
        return saleItems.reduce((total, item) => total + (item.total || 0), 0);
    };

    // Calculate discount amount
    const calculateDiscountAmount = (subtotal) => {
        if (discountType === 'percentage') {
            return subtotal * (discountValue / 100);
        }
        return discountValue;
    };

    // Calculate tax amount
    const calculateTaxAmount = (subtotalAfterDiscount) => {
        return subtotalAfterDiscount * (taxRate / 100);
    };

    // Calculate grand total (with discount and tax)
    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const discountAmount = calculateDiscountAmount(subtotal);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = calculateTaxAmount(subtotalAfterDiscount);
        return subtotalAfterDiscount + taxAmount;
    };

    // Calculate change due
    const calculateChangeDue = () => {
        const grandTotal = calculateGrandTotal();
        return Math.max(0, amountPaid - grandTotal);
    };

    // Calculate total profit for the sale
    const calculateTotalProfit = () => {
        return saleItems.reduce((total, item) => total + (item.totalProfit || 0), 0);
    };

    // Calculate profit margin percentage
    const calculateProfitMargin = () => {
        const subtotal = calculateSubtotal();
        const totalProfit = calculateTotalProfit();
        return subtotal > 0 ? ((totalProfit / subtotal) * 100) : 0;
    };

    // Validate sale
    const validateSale = () => {
        const newErrors = {};
        
        if (!selectedCustomer) {
            newErrors.customer = 'Please select a customer';
        }
        
        if (!selectedSupplier) {
            newErrors.supplier = 'Please select a supplier';
        }
        
        if (saleItems.length === 0) {
            newErrors.items = 'Please add at least one item to the sale';
        }
        
        saleItems.forEach((item, index) => {
            if (!item.product) {
                newErrors[`item_${index}_product`] = 'Please select a product';
            }
            if (item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
            if (item.unitPrice <= 0) {
                newErrors[`item_${index}_price`] = 'Price must be greater than 0';
            }
            // Check if quantity exceeds available stock
            if (item.product && item.quantity > item.product.quantity) {
                newErrors[`item_${index}_quantity`] = `Only ${item.product.quantity} units available`;
            }
        });

        // Payment validation - allow partial payments
        if (amountPaid < 0) {
            newErrors.amountPaid = 'Amount paid cannot be negative';
        }
        
        if (discountValue < 0) {
            newErrors.discount = 'Discount cannot be negative';
        }
        
        if (discountType === 'percentage' && discountValue > 100) {
            newErrors.discount = 'Percentage discount cannot exceed 100%';
        }
        
        if (taxRate < 0) {
            newErrors.tax = 'Tax rate cannot be negative';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Process sale
    const processSale = async () => {
        if (!validateSale()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // Prepare sale data for API
            const subtotal = calculateSubtotal();
            const totalProfit = calculateTotalProfit();
            const profitMargin = calculateProfitMargin();
            
            const saleData = {
                customer: selectedCustomer.value,
                supplier: selectedSupplier.value,
                items: saleItems.map(item => ({
                    product: item.product.value,
                    productName: item.product.label,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    actualPrice: item.actualPrice,
                    profitPerUnit: item.profitPerUnit,
                    totalProfit: item.totalProfit,
                    total: item.total
                })),
                subtotal: subtotal,
                totalProfit: totalProfit,
                profitMargin: profitMargin,
                discountType: discountType,
                discountValue: discountValue,
                taxRate: taxRate,
                amountPaid: amountPaid,
                paymentMethod: paymentMethod,
                notes: ''
            };

            // Create sale in database (this will also handle price history)
            const saleResponse = await saleService.createSale(saleData);
            
            if (!saleResponse.success) {
                throw new Error(saleResponse.message || 'Failed to create sale');
            }

            // Update product quantities (decrease stock)
            const productUpdates = [];
            for (const item of saleItems) {
                if (item.product) {
                    const newQuantity = item.product.quantity - item.quantity;
                    productUpdates.push({
                        productId: item.product.value,
                        newQuantity: newQuantity,
                        soldQuantity: item.quantity
                    });
                    
                    // Update the product stock using the specific stock update method
                    try {
                        await productService.updateProductStock(item.product.value, newQuantity, 'set');
                        console.log(`Updated product ${item.product.label} stock: ${item.product.quantity} -> ${newQuantity}`);
                    } catch (error) {
                        console.error(`Failed to update stock for product ${item.product.label}:`, error);
                        throw new Error(`Failed to update stock for ${item.product.label}`);
                    }
                }
            }

            console.log('Sale created successfully:', saleResponse.data);
            toast({
                title: "Sale Processed Successfully!",
                description: `Sale #${saleResponse.data.saleNumber} created • Total: $${calculateGrandTotal().toFixed(2)} • ${productUpdates.length} product(s) stock updated`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Refresh products data to show updated stock
            await fetchInitialData();
            
            // Reset form
            setSelectedCustomer(null);
            setSelectedSupplier(null);
            setSaleItems([]);
            setErrors({});
            setDiscountType('percentage');
            setDiscountValue(0);
            setTaxRate(0);
            setAmountPaid(0);
            setPaymentMethod('cash');
            
            if (onSaleProcessed) {
                onSaleProcessed({
                    saleData: saleResponse.data,
                    customer: selectedCustomer,
                    supplier: selectedSupplier,
                    items: saleItems,
                    total: calculateGrandTotal(),
                    productUpdates: productUpdates
                });
            }
            
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process sale",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedCustomer(null);
            setSelectedSupplier(null);
            setSaleItems([]);
            setErrors({});
            setCustomerPriceHistory({});
            setDiscountType('percentage');
            setDiscountValue(0);
            setTaxRate(0);
            setAmountPaid(0);
            setPaymentMethod('cash');
        }
    }, [isOpen]);

    // Convert data for react-select
    const customerOptions = customers.map(customer => ({
        value: customer._id,
        label: customer.name,
        customer: customer
    }));

    const supplierOptions = suppliers.map(supplier => ({
        value: supplier._id,
        label: supplier.name,
        supplier: supplier
    }));

    const productOptions = products.map(product => ({
        value: product._id,
        label: `${product.name} (Stock: ${product.quantity})`,
        price: product.price,
        quantity: product.quantity,
        product: product
    }));



    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderRadius: '12px',
            borderWidth: '2px',
            borderColor: state.isFocused ? '#38B2AC' : '#E2E8F0',
            backgroundColor: 'white',
            minHeight: '48px',
            boxShadow: state.isFocused ? '0 0 0 1px #38B2AC' : 'none',
            '&:hover': {
                borderColor: '#38B2AC'
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
            backgroundColor: state.isSelected ? '#38B2AC' : state.isFocused ? '#F7FAFC' : 'white',
            color: state.isSelected ? 'white' : '#2D3748',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: state.isSelected ? '#38B2AC' : '#EDF2F7'
            }
        })
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl" boxShadow="2xl" maxW="1200px">
                {/* Header */}
                <Box
                    bgGradient="linear(135deg, teal.500 0%, cyan.500 100%)"
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
                            <FaDollarSign fontSize="32px" color="white" />
                        </Box>
                        <Box>
                            <Text fontSize="2xl" fontWeight="bold">
                                Process Sale
                            </Text>
                            <Text color="whiteAlpha.900" fontSize="md">
                                Create a new sale transaction with pricing history
                            </Text>
                        </Box>
                    </HStack>
                </Box>
                
                <ModalCloseButton color="white" size="lg" />
                
                <ModalBody px={8} py={6} maxH="70vh" overflowY="auto">
                    <VStack spacing={6} align="stretch">
                        {/* Customer and Supplier Selection */}
                        <Box>
                            <HStack spacing={2} mb={4}>
                                <FaUsers fontSize="24px" color="var(--chakra-colors-gray-600)" />
                                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                    Customer & Supplier Information
                                </Text>
                            </HStack>
                            
                            <HStack spacing={4} align="start">
                                <FormControl isInvalid={errors.customer} flex="1">
                                    <FormLabel fontWeight="semibold" color="gray.700">
                                        Select Customer *
                                    </FormLabel>
                                    <ReactSelect
                                        value={selectedCustomer}
                                        onChange={setSelectedCustomer}
                                        options={customerOptions}
                                        placeholder="Search and select customer..."
                                        isSearchable
                                        isClearable
                                        styles={selectStyles}
                                        formatOptionLabel={(option) => (
                                            <Box>
                                                <Text fontWeight="semibold">{option.label}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {option.customer.email} • {option.customer.phone}
                                                </Text>
                                            </Box>
                                        )}
                                    />
                                    <FormErrorMessage>{errors.customer}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.supplier} flex="1">
                                    <FormLabel fontWeight="semibold" color="gray.700">
                                        Select Supplier *
                                    </FormLabel>
                                    <ReactSelect
                                        value={selectedSupplier}
                                        onChange={setSelectedSupplier}
                                        options={supplierOptions}
                                        placeholder="Search and select supplier..."
                                        isSearchable
                                        isClearable
                                        styles={selectStyles}
                                        formatOptionLabel={(option) => (
                                            <Box>
                                                <Text fontWeight="semibold">{option.label}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {option.supplier.email} • {option.supplier.phone}
                                                </Text>
                                            </Box>
                                        )}
                                    />
                                    <FormErrorMessage>{errors.supplier}</FormErrorMessage>
                                </FormControl>
                            </HStack>
                        </Box>

                        <Divider />

                        {/* Sale Items */}
                        <Box>
                            <HStack spacing={2} mb={4} justify="space-between">
                                <HStack spacing={2}>
                                    <FaShoppingBag fontSize="24px" color="var(--chakra-colors-brand-600)" />
                                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                        Sale Items
                                    </Text>
                                </HStack>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="teal"
                                    size="sm"
                                    onClick={addSaleItem}
                                    borderRadius="xl"
                                >
                                    Add Item
                                </Button>
                            </HStack>

                            {errors.items && (
                                <Alert status="error" borderRadius="xl" mb={4}>
                                    <AlertIcon />
                                    <AlertTitle>No Items Added!</AlertTitle>
                                    <AlertDescription>{errors.items}</AlertDescription>
                                </Alert>
                            )}

                            {saleItems.length > 0 && (
                                <Box bg="gray.50" borderRadius="xl" p={4}>
                                    <TableContainer>
                                        <Table variant="simple" size="sm">
                                            <Thead>
                                                <Tr>
                                                    <Th>Product</Th>
                                                    <Th>Previous Price</Th>
                                                    <Th>Current Price</Th>
                                                    <Th>Quantity</Th>
                                                    <Th>Actual Price</Th>
                                                    <Th>Total</Th>
                                                    <Th width="50px">Action</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {saleItems.map((item, index) => {
                                                    const historyKey = selectedCustomer && item.product 
                                                        ? `customer_${selectedCustomer.value}_product_${item.product.value}`
                                                        : null;
                                                    const history = historyKey ? customerPriceHistory[historyKey] : null;
                                                    
                                                    return (
                                                        <Tr key={item.id}>
                                                            <Td>
                                                                <Box minW="200px">
                                                                    <ReactSelect
                                                                        key={`product-select-${item.id}-${productOptions.length}`}
                                                                        value={item.product}
                                                                        onChange={(value) => {
                                                                            console.log('Product selected:', value);
                                                                            updateSaleItem(item.id, 'product', value);
                                                                        }}
                                                                        options={productOptions}
                                                                        placeholder="Select product..."
                                                                        isSearchable={true}
                                                                        isClearable={true}
                                                                        styles={{
                                                                            menu: (base) => ({
                                                                                ...base,
                                                                                zIndex: 9999,
                                                                                position: 'absolute'
                                                                            }),
                                                                            menuPortal: (base) => ({
                                                                                ...base,
                                                                                zIndex: 9999
                                                                            })
                                                                        }}
                                                                        menuPortalTarget={document.body}
                                                                    />
                                                                    {errors[`item_${index}_product`] && (
                                                                        <Text fontSize="xs" color="red.500" mt={1}>
                                                                            {errors[`item_${index}_product`]}
                                                                        </Text>
                                                                    )}
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                {item.previousPrice ? (
                                                                    <Tooltip label={`Last purchase: ${history && history.length > 0 ? new Date(history[history.length - 1].date).toLocaleDateString() : 'Unknown'}`}>
                                                                        <Badge colorScheme="blue" borderRadius="full">
                                                                            ${item.previousPrice.toFixed(2)}
                                                                        </Badge>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Badge colorScheme="gray" borderRadius="full">
                                                                        First purchase
                                                                    </Badge>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                <NumberInput
                                                                    value={item.unitPrice}
                                                                    onChange={(value) => updateSaleItem(item.id, 'unitPrice', Number(value))}
                                                                    min={0}
                                                                    precision={2}
                                                                    step={0.01}
                                                                    size="sm"
                                                                >
                                                                    <NumberInputField borderRadius="lg" />
                                                                    <NumberInputStepper>
                                                                        <NumberIncrementStepper />
                                                                        <NumberDecrementStepper />
                                                                    </NumberInputStepper>
                                                                </NumberInput>
                                                                {errors[`item_${index}_price`] && (
                                                                    <Text fontSize="xs" color="red.500" mt={1}>
                                                                        {errors[`item_${index}_price`]}
                                                                    </Text>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                <NumberInput
                                                                    value={item.quantity}
                                                                    onChange={(value) => updateSaleItem(item.id, 'quantity', Number(value))}
                                                                    min={1}
                                                                    max={item.product ? item.product.quantity : undefined}
                                                                    size="sm"
                                                                >
                                                                    <NumberInputField borderRadius="lg" />
                                                                    <NumberInputStepper>
                                                                        <NumberIncrementStepper />
                                                                        <NumberDecrementStepper />
                                                                    </NumberInputStepper>
                                                                </NumberInput>
                                                                {errors[`item_${index}_quantity`] && (
                                                                    <Text fontSize="xs" color="red.500" mt={1}>
                                                                        {errors[`item_${index}_quantity`]}
                                                                    </Text>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                {item.product ? (
                                                                    <Badge colorScheme="teal" borderRadius="full" fontSize="sm">
                                                                        ${item.product.price.toFixed(2)}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge colorScheme="gray" borderRadius="full" fontSize="sm">
                                                                        N/A
                                                                    </Badge>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                <Text fontWeight="bold" color="green.600">
                                                                    ${(item.total || 0).toFixed(2)}
                                                                </Text>
                                                            </Td>
                                                            <Td>
                                                                <IconButton
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => removeSaleItem(item.id)}
                                                                />
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>

                                    {/* Subtotal and Payment Calculations */}
                                    <Box mt={4} p={4} bg="white" borderRadius="xl" border="2px solid" borderColor="teal.200">
                                        <VStack spacing={2}>
                                            {/* Subtotal */}
                                            <Flex align="center" w="full">
                                                <Text fontSize="md" color="gray.600">Subtotal:</Text>
                                                <Spacer />
                                                <Text fontSize="md" fontWeight="semibold">
                                                    ${calculateSubtotal().toFixed(2)}
                                                </Text>
                                            </Flex>
                                            
                                            {/* Profit Information */}
                                            {calculateTotalProfit() > 0 && (
                                                <>
                                                    <Flex align="center" w="full">
                                                        <Text fontSize="md" color="green.600">Total Profit:</Text>
                                                        <Spacer />
                                                        <Text fontSize="md" fontWeight="semibold" color="green.600">
                                                            ${calculateTotalProfit().toFixed(2)}
                                                        </Text>
                                                    </Flex>
                                                    <Flex align="center" w="full">
                                                        <Text fontSize="sm" color="green.500">Profit Margin:</Text>
                                                        <Spacer />
                                                        <Text fontSize="sm" fontWeight="semibold" color="green.500">
                                                            {calculateProfitMargin().toFixed(1)}%
                                                        </Text>
                                                    </Flex>
                                                </>
                                            )}
                                            
                                            {/* Discount */}
                                            {discountValue > 0 && (
                                                <Flex align="center" w="full">
                                                    <Text fontSize="md" color="red.500">
                                                        Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}):
                                                    </Text>
                                                    <Spacer />
                                                    <Text fontSize="md" fontWeight="semibold" color="red.500">
                                                        -${calculateDiscountAmount(calculateSubtotal()).toFixed(2)}
                                                    </Text>
                                                </Flex>
                                            )}
                                            
                                            {/* Tax */}
                                            {taxRate > 0 && (
                                                <Flex align="center" w="full">
                                                    <Text fontSize="md" color="gray.600">Tax ({taxRate}%):</Text>
                                                    <Spacer />
                                                    <Text fontSize="md" fontWeight="semibold">
                                                        ${calculateTaxAmount(calculateSubtotal() - calculateDiscountAmount(calculateSubtotal())).toFixed(2)}
                                                    </Text>
                                                </Flex>
                                            )}
                                            
                                            <Divider />
                                            
                                            {/* Grand Total */}
                                            <Flex align="center" w="full">
                                                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                                                    Grand Total:
                                                </Text>
                                                <Spacer />
                                                <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                                                    ${calculateGrandTotal().toFixed(2)}
                                                </Text>
                                            </Flex>
                                            
                                            {/* Payment Info */}
                                            {amountPaid > 0 && (
                                                <>
                                                    <Flex align="center" w="full">
                                                        <Text fontSize="md" color="gray.600">Amount Paid:</Text>
                                                        <Spacer />
                                                        <Text fontSize="md" fontWeight="semibold" color="green.600">
                                                            ${amountPaid.toFixed(2)}
                                                        </Text>
                                                    </Flex>
                                                    
                                                    <Flex align="center" w="full">
                                                        <Text fontSize="md" color="gray.600">Change Due:</Text>
                                                        <Spacer />
                                                        <Text fontSize="md" fontWeight="bold" color="blue.600">
                                                            ${calculateChangeDue().toFixed(2)}
                                                        </Text>
                                                    </Flex>
                                                </>
                                            )}
                                        </VStack>
                                    </Box>
                                </Box>
                            )}

                            {saleItems.length === 0 && (
                                <Box
                                    textAlign="center"
                                    py={10}
                                    bg="gray.50"
                                    borderRadius="xl"
                                    border="2px dashed"
                                    borderColor="gray.300"
                                >
                                    <VStack spacing={4}>
                                        <FaShoppingCart fontSize="64px" color="var(--chakra-colors-gray-400)" />
                                        <Text color="gray.600" fontSize="lg">
                                            No items added to sale yet
                                        </Text>
                                        <Button
                                            leftIcon={<AddIcon />}
                                            colorScheme="teal"
                                            onClick={addSaleItem}
                                            borderRadius="xl"
                                        >
                                            Add Your First Item
                                        </Button>
                                    </VStack>
                                </Box>
                            )}
                        </Box>

                        {/* Payment Processing Section */}
                        {saleItems.length > 0 && (
                            <>
                                <Divider />
                                <Box>
                                    <HStack spacing={2} mb={4}>
                                        <FaCreditCard fontSize="24px" color="var(--chakra-colors-purple-600)" />
                                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                            Payment Processing
                                        </Text>
                                    </HStack>

                                    <Box bg="gray.50" borderRadius="xl" p={6}>
                                        <VStack spacing={6}>
                                            {/* Discount Section */}
                                            <Box w="full">
                                                <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                                                    Discount (Optional)
                                                </Text>
                                                <HStack spacing={4}>
                                                    <FormControl flex="1">
                                                        <FormLabel fontSize="sm">Discount Type</FormLabel>
                                                        <ReactSelect
                                                            value={{ value: discountType, label: discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)' }}
                                                            onChange={(option) => setDiscountType(option.value)}
                                                            options={[
                                                                { value: 'percentage', label: 'Percentage (%)' },
                                                                { value: 'fixed', label: 'Fixed Amount ($)' }
                                                            ]}
                                                            styles={selectStyles}
                                                        />
                                                    </FormControl>
                                                    <FormControl flex="1" isInvalid={errors.discount}>
                                                        <FormLabel fontSize="sm">
                                                            {discountType === 'percentage' ? 'Discount %' : 'Discount Amount ($)'}
                                                        </FormLabel>
                                                        <NumberInput
                                                            value={discountValue}
                                                            onChange={(value) => setDiscountValue(parseFloat(value) || 0)}
                                                            min={0}
                                                            max={discountType === 'percentage' ? 100 : undefined}
                                                            precision={2}
                                                        >
                                                            <NumberInputField />
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper />
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                        <FormErrorMessage>{errors.discount}</FormErrorMessage>
                                                    </FormControl>
                                                </HStack>
                                            </Box>

                                            {/* Tax Section */}
                                            <Box w="full">
                                                <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                                                    Tax Settings
                                                </Text>
                                                <FormControl isInvalid={errors.tax}>
                                                    <FormLabel fontSize="sm">Tax Rate (%)</FormLabel>
                                                    <NumberInput
                                                        value={taxRate}
                                                        onChange={(value) => setTaxRate(parseFloat(value) || 0)}
                                                        min={0}
                                                        precision={2}
                                                        maxW="200px"
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                    <FormErrorMessage>{errors.tax}</FormErrorMessage>
                                                </FormControl>
                                            </Box>

                                            {/* Payment Method and Amount */}
                                            <Box w="full">
                                                <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                                                    Payment Details
                                                </Text>
                                                <HStack spacing={4}>
                                                    <FormControl flex="1">
                                                        <FormLabel fontSize="sm">Payment Method</FormLabel>
                                                        <ReactSelect
                                                            value={{ value: paymentMethod, label: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) }}
                                                            onChange={(option) => setPaymentMethod(option.value)}
                                                            options={[
                                                                { value: 'cash', label: 'Cash' },
                                                                { value: 'card', label: 'Card' },
                                                                { value: 'cheque', label: 'Cheque' },
                                                                { value: 'bank_transfer', label: 'Bank Transfer' }
                                                            ]}
                                                            styles={selectStyles}
                                                        />
                                                    </FormControl>
                                                    <FormControl flex="1" isInvalid={errors.amountPaid}>
                                                        <FormLabel fontSize="sm">Amount Paid ($)</FormLabel>
                                                        <NumberInput
                                                            value={amountPaid}
                                                            onChange={(value) => setAmountPaid(parseFloat(value) || 0)}
                                                            min={0}
                                                            precision={2}
                                                        >
                                                            <NumberInputField />
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper />
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                        <FormErrorMessage>{errors.amountPaid}</FormErrorMessage>
                                                    </FormControl>
                                                </HStack>
                                            </Box>

                                            {/* Payment Summary */}
                                            <Box w="full" bg="white" p={4} borderRadius="xl" border="2px solid" borderColor="blue.200">
                                                <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.700">
                                                    Payment Summary
                                                </Text>
                                                <VStack spacing={2}>
                                                    <Flex w="full">
                                                        <Text>Subtotal:</Text>
                                                        <Spacer />
                                                        <Text fontWeight="semibold">${calculateSubtotal().toFixed(2)}</Text>
                                                    </Flex>
                                                    {discountValue > 0 && (
                                                        <Flex w="full">
                                                            <Text color="red.500">Discount:</Text>
                                                            <Spacer />
                                                            <Text fontWeight="semibold" color="red.500">
                                                                -${calculateDiscountAmount(calculateSubtotal()).toFixed(2)}
                                                            </Text>
                                                        </Flex>
                                                    )}
                                                    {taxRate > 0 && (
                                                        <Flex w="full">
                                                            <Text>Tax ({taxRate}%):</Text>
                                                            <Spacer />
                                                            <Text fontWeight="semibold">
                                                                ${calculateTaxAmount(calculateSubtotal() - calculateDiscountAmount(calculateSubtotal())).toFixed(2)}
                                                            </Text>
                                                        </Flex>
                                                    )}
                                                    <Divider />
                                                    <Flex w="full">
                                                        <Text fontSize="lg" fontWeight="bold">Total Due:</Text>
                                                        <Spacer />
                                                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                                            ${calculateGrandTotal().toFixed(2)}
                                                        </Text>
                                                    </Flex>
                                                    {amountPaid > 0 && (
                                                        <>
                                                            <Flex w="full">
                                                                <Text color="green.600">Amount Paid:</Text>
                                                                <Spacer />
                                                                <Text fontWeight="semibold" color="green.600">
                                                                    ${amountPaid.toFixed(2)}
                                                                </Text>
                                                            </Flex>
                                                            <Flex w="full">
                                                                <Text fontSize="md" fontWeight="bold" color={calculateChangeDue() >= 0 ? "blue.600" : "red.600"}>
                                                                    Change Due:
                                                                </Text>
                                                                <Spacer />
                                                                <Text fontSize="md" fontWeight="bold" color={calculateChangeDue() >= 0 ? "blue.600" : "red.600"}>
                                                                    ${calculateChangeDue().toFixed(2)}
                                                                </Text>
                                                            </Flex>
                                                        </>
                                                    )}
                                                </VStack>
                                            </Box>
                                        </VStack>
                                    </Box>
                                </Box>
                            </>
                        )}
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
                            onClick={processSale}
                            colorScheme="teal"
                            size="lg"
                            borderRadius="xl"
                            px={8}
                            isLoading={loading}
                            loadingText="Processing Sale..."
                            leftIcon={<CheckCircleIcon />}
                            _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 25px rgba(56, 178, 172, 0.4)"
                            }}
                            boxShadow="0 5px 15px rgba(56, 178, 172, 0.3)"
                            isDisabled={saleItems.length === 0}
                        >
                            Process Sale
                        </Button>
                    </HStack>
                </Box>
            </ModalContent>
        </Modal>
    );
};

export default ProcessSaleModal;