import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Heading,
    HStack,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    Badge,
    Text,
    Flex,
    Spacer,
    useToast,
    Spinner,
    Avatar,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Tooltip,
    Tag,
    TagLabel,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Divider
} from '@chakra-ui/react';
import {
    SearchIcon,
    AddIcon,
    EditIcon,
    DeleteIcon,
    ViewIcon,
    ChevronDownIcon,
    WarningIcon,
    InfoIcon
} from '@chakra-ui/icons';
import { FaBoxes } from 'react-icons/fa';
import productService from '../services/productService';
import supplierService from '../services/supplierService';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import AddCategoryModal from './AddCategoryModal';

const InventoryManagement = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [stockUpdateProduct, setStockUpdateProduct] = useState(null);
    const [stockOperation, setStockOperation] = useState('set');
    const [stockQuantity, setStockQuantity] = useState(0);
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    
    const toast = useToast();
    
    // Modal controls
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isAddCategoryOpen, onOpen: onAddCategoryOpen, onClose: onAddCategoryClose } = useDisclosure();
    const { isOpen: isStockUpdateOpen, onOpen: onStockUpdateOpen, onClose: onStockUpdateClose } = useDisclosure();
    
    const cancelRef = React.useRef();

    // Fetch data on component mount
    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
        fetchCategories();
    }, []);

    // Real-time filtering effect
    useEffect(() => {
        let filtered = [...allProducts];
        
        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.batchName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }
        
        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(product => product.status === selectedStatus);
        }
        
        // Supplier filter
        if (selectedSupplier) {
            filtered = filtered.filter(product => product.supplier._id === selectedSupplier);
        }
        
        // Price range filter
        if (priceRange.min) {
            filtered = filtered.filter(product => product.price >= Number(priceRange.min));
        }
        if (priceRange.max) {
            filtered = filtered.filter(product => product.price <= Number(priceRange.max));
        }
        
        setProducts(filtered);
    }, [searchQuery, selectedCategory, selectedStatus, selectedSupplier, priceRange, allProducts]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts();
            if (response.success) {
                setAllProducts(response.data);
                setProducts(response.data);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to fetch products",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch products",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await supplierService.getAllSuppliers();
            if (response.success) {
                setSuppliers(response.data);
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productService.getCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSelectedSupplier('');
        setPriceRange({ min: '', max: '' });
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        onEditOpen();
    };

    const handleDeleteClick = (product) => {
        setDeleteProduct(product);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await productService.deleteProduct(deleteProduct._id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Product deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchProducts();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to delete product",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete product",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeleteProduct(null);
            onDeleteClose();
        }
    };

    const handleStockUpdate = (product) => {
        setStockUpdateProduct(product);
        setStockQuantity(product.quantity);
        setStockOperation('set');
        onStockUpdateOpen();
    };

    const handleStockUpdateConfirm = async () => {
        try {
            const response = await productService.updateProductStock(
                stockUpdateProduct._id, 
                stockQuantity, 
                stockOperation
            );
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Stock updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchProducts();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update stock",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update stock",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setStockUpdateProduct(null);
            onStockUpdateClose();
        }
    };

    const handleProductAdded = () => {
        fetchProducts();
        fetchCategories(); // Refresh categories in case a new one was added
        onAddClose();
    };

    const handleProductUpdated = () => {
        fetchProducts();
        onEditClose();
    };

    const handleCategoryAdded = () => {
        fetchCategories();
        onAddCategoryClose();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'gray';
            case 'discontinued': return 'red';
            case 'out-of-stock': return 'orange';
            default: return 'gray';
        }
    };

    const getStockStatusColor = (quantity) => {
        if (quantity === 0) return 'red';
        if (quantity <= 10) return 'orange';
        return 'green';
    };

    const formatPrice = (price, discount = 0) => {
        const finalPrice = price - (price * discount / 100);
        return finalPrice.toFixed(2);
    };

    if (loading && products.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="purple.500" />
                    <Text>Loading inventory...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Modern Header Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" mb={6} overflow="hidden">
                <Box
                    bgGradient="linear(135deg, purple.500 0%, pink.500 100%)"
                    px={8}
                    py={6}
                    color="white"
                >
                    <Flex align="center" justify="space-between">
                        <Box>
                            <HStack spacing={3} mb={2}>
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
                                    <FaBoxes fontSize="32px" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="xl" fontWeight="bold">
                                        Inventory Management
                                    </Heading>
                                    <Text color="whiteAlpha.900" fontSize="md">
                                        Manage your products and stock levels
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>
                        <HStack spacing={3} ml={8} mr={4}>
                            <Button
                                leftIcon={<AddIcon />}
                                bg="whiteAlpha.200"
                                color="white"
                                _hover={{
                                    bg: "whiteAlpha.300",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                                }}
                                onClick={onAddCategoryOpen}
                                size="lg"
                                borderRadius="xl"
                                backdropFilter="blur(10px)"
                                border="1px solid rgba(255,255,255,0.2)"
                                fontWeight="semibold"
                            >
                                Add Category
                            </Button>
                            <Button
                                leftIcon={<AddIcon />}
                                bg="whiteAlpha.200"
                                color="white"
                                _hover={{
                                    bg: "whiteAlpha.300",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                                }}
                                onClick={onAddOpen}
                                size="lg"
                                borderRadius="xl"
                                backdropFilter="blur(10px)"
                                border="1px solid rgba(255,255,255,0.2)"
                                fontWeight="semibold"
                            >
                                Add Product
                            </Button>
                        </HStack>
                    </Flex>
                </Box>

                {/* Search and Filter Section */}
                <Box px={8} py={6} bg="gray.50">
                    <VStack spacing={4} align="stretch">
                        {/* Search Bar */}
                        <HStack spacing={4} justify="space-between">
                            <InputGroup maxW="500px" size="lg">
                                <InputLeftElement pointerEvents="none" h="full">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search products by name, description, or batch..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    borderRadius="xl"
                                    bg="white"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="purple.500"
                                    _hover={{ borderColor: 'purple.300' }}
                                    fontSize="md"
                                />
                            </InputGroup>
                            
                            {(searchQuery || selectedCategory || selectedStatus || selectedSupplier || priceRange.min || priceRange.max) && (
                                <Button 
                                    onClick={clearFilters} 
                                    variant="outline" 
                                    borderRadius="xl"
                                    size="lg"
                                    borderWidth="2px"
                                    colorScheme="red"
                                    _hover={{
                                        bg: "red.50",
                                        transform: "translateY(-1px)"
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </HStack>

                        {/* Filter Controls */}
                        <HStack spacing={4} wrap="wrap">
                            {/* Category Filter */}
                            <Select
                                placeholder="All Categories"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                maxW="200px"
                                bg="white"
                                borderRadius="xl"
                                border="2px solid"
                                borderColor="gray.200"
                                focusBorderColor="purple.500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Select>

                            {/* Status Filter */}
                            <Select
                                placeholder="All Status"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                maxW="150px"
                                bg="white"
                                borderRadius="xl"
                                border="2px solid"
                                borderColor="gray.200"
                                focusBorderColor="purple.500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="discontinued">Discontinued</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </Select>

                            {/* Supplier Filter */}
                            <Select
                                placeholder="All Suppliers"
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                maxW="200px"
                                bg="white"
                                borderRadius="xl"
                                border="2px solid"
                                borderColor="gray.200"
                                focusBorderColor="purple.500"
                            >
                                {suppliers.map(supplier => (
                                    <option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </Select>

                            {/* Price Range */}
                            <HStack spacing={2}>
                                <Input
                                    placeholder="Min Price"
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    maxW="120px"
                                    bg="white"
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="purple.500"
                                />
                                <Text color="gray.500">-</Text>
                                <Input
                                    placeholder="Max Price"
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    maxW="120px"
                                    bg="white"
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="purple.500"
                                />
                            </HStack>
                        </HStack>

                        {/* Stats */}
                        <HStack spacing={6} justify="space-between">
                            <HStack spacing={4}>
                                <Box
                                    bg="purple.100"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    border="2px solid"
                                    borderColor="purple.200"
                                >
                                    <HStack spacing={2}>
                                        <Box w="3" h="3" bg="purple.500" borderRadius="full" />
                                        <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                                            Total Products: {allProducts.length}
                                        </Text>
                                    </HStack>
                                </Box>
                                {(searchQuery || selectedCategory || selectedStatus || selectedSupplier || priceRange.min || priceRange.max) && (
                                    <Box
                                        bg="pink.100"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                        border="2px solid"
                                        borderColor="pink.200"
                                    >
                                        <HStack spacing={2}>
                                            <SearchIcon w="3" h="3" color="pink.500" />
                                            <Text fontSize="sm" fontWeight="semibold" color="pink.700">
                                                Filtered Results: {products.length}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                            </HStack>
                        </HStack>
                    </VStack>
                </Box>
            </Box>

            {/* Products Table Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" overflow="hidden">
                <Box px={8} py={8}>
                    {products.length === 0 ? (
                        <Box 
                            textAlign="center" 
                            py={20} 
                            mt={16}
                            mx={8}
                            bg="gray.50"
                            borderRadius="2xl"
                            border="2px dashed"
                            borderColor="gray.200"
                        >
                            <VStack spacing={10}>
                                <Box
                                    w="28"
                                    h="28"
                                    bg="white"
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    border="4px solid"
                                    borderColor="gray.300"
                                    boxShadow="lg"
                                >
                                    <FaBoxes fontSize="80px" color="var(--chakra-colors-gray-400)" />
                                </Box>
                                <Box maxW="lg" px={6}>
                                    <Heading size="xl" color="gray.700" mb={6}>
                                        {searchQuery || selectedCategory || selectedStatus || selectedSupplier || priceRange.min || priceRange.max
                                            ? 'No products found' 
                                            : 'No products yet'}
                                    </Heading>
                                    <Text color="gray.600" fontSize="lg" lineHeight="1.8">
                                        {searchQuery || selectedCategory || selectedStatus || selectedSupplier || priceRange.min || priceRange.max
                                            ? 'No products match your current filters. Try adjusting your search criteria or add a new product.' 
                                            : 'Your inventory is empty. Start building your product catalog by adding your first product to the system.'}
                                    </Text>
                                </Box>
                                {!(searchQuery || selectedCategory || selectedStatus || selectedSupplier || priceRange.min || priceRange.max) && (
                                    <Button
                                        leftIcon={<AddIcon />}
                                        colorScheme="purple"
                                        onClick={onAddOpen}
                                        size="xl"
                                        borderRadius="xl"
                                        px={12}
                                        py={8}
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mt={8}
                                        _hover={{
                                            transform: "translateY(-3px)",
                                            boxShadow: "0 15px 35px rgba(159, 122, 234, 0.4)"
                                        }}
                                        boxShadow="0 8px 20px rgba(159, 122, 234, 0.3)"
                                    >
                                        Add Your First Product
                                    </Button>
                                )}
                            </VStack>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table variant="simple" size="lg">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Product</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Category</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Price</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Stock</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Supplier</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Status</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {products.map((product, index) => (
                                        <Tr 
                                            key={product._id}
                                            _hover={{ bg: "gray.50", transform: "scale(1.01)" }}
                                            transition="all 0.2s"
                                            borderLeft="4px solid transparent"
                                            _hoverselected={{ borderLeftColor: "purple.500" }}
                                        >
                                            <Td py={6}>
                                                <VStack align="start" spacing={2}>
                                                    <Text fontWeight="bold" fontSize="md" color="gray.800">
                                                        {product.name}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600" maxW="200px" isTruncated>
                                                        {product.description}
                                                    </Text>
                                                    <Badge 
                                                        colorScheme="purple" 
                                                        size="sm" 
                                                        borderRadius="full"
                                                        variant="subtle"
                                                    >
                                                        Batch: {product.batchName}
                                                    </Badge>
                                                </VStack>
                                            </Td>
                                            <Td py={6}>
                                                <Tag colorScheme="blue" borderRadius="full">
                                                    <TagLabel>{product.category}</TagLabel>
                                                </Tag>
                                            </Td>
                                            <Td py={6}>
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                                                        ${formatPrice(product.price, product.discount)}
                                                    </Text>
                                                    {product.discount > 0 && (
                                                        <HStack spacing={2}>
                                                            <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                                                                ${product.price.toFixed(2)}
                                                            </Text>
                                                            <Badge colorScheme="red" size="sm">
                                                                -{product.discount}%
                                                            </Badge>
                                                        </HStack>
                                                    )}
                                                </VStack>
                                            </Td>
                                            <Td py={6}>
                                                <HStack spacing={2}>
                                                    <Text 
                                                        fontWeight="bold" 
                                                        fontSize="lg"
                                                        color={getStockStatusColor(product.quantity)}
                                                    >
                                                        {product.quantity}
                                                    </Text>
                                                    <Tooltip label="Update Stock">
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            size="xs"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() => handleStockUpdate(product)}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                                {product.quantity === 0 && (
                                                    <HStack spacing={1} mt={1}>
                                                        <WarningIcon w="3" h="3" color="red.500" />
                                                        <Text fontSize="xs" color="red.500" fontWeight="medium">
                                                            Out of Stock
                                                        </Text>
                                                    </HStack>
                                                )}
                                            </Td>
                                            <Td py={6}>
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                                    {product.supplier?.name}
                                                </Text>
                                            </Td>
                                            <Td py={6}>
                                                <Badge 
                                                    colorScheme={getStatusColor(product.status)} 
                                                    size="md" 
                                                    borderRadius="full"
                                                    px={3}
                                                    py={1}
                                                >
                                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                </Badge>
                                            </Td>
                                            <Td py={6}>
                                                <HStack spacing={2}>
                                                    <Tooltip label="View Details">
                                                        <IconButton
                                                            icon={<ViewIcon />}
                                                            aria-label="View Product"
                                                            size="sm"
                                                            colorScheme="blue"
                                                            variant="ghost"
                                                            borderRadius="lg"
                                                            onClick={() => handleEdit(product)}
                                                            _hover={{
                                                                bg: "blue.100",
                                                                transform: "scale(1.1)"
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Edit Product">
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            aria-label="Edit Product"
                                                            size="sm"
                                                            colorScheme="green"
                                                            variant="ghost"
                                                            borderRadius="lg"
                                                            onClick={() => handleEdit(product)}
                                                            _hover={{
                                                                bg: "green.100",
                                                                transform: "scale(1.1)"
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Delete Product">
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            aria-label="Delete Product"
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            borderRadius="lg"
                                                            onClick={() => handleDeleteClick(product)}
                                                            _hover={{
                                                                bg: "red.100",
                                                                transform: "scale(1.1)"
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Box>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddOpen}
                onClose={onAddClose}
                onProductAdded={handleProductAdded}
                suppliers={suppliers}
                categories={categories}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                product={selectedProduct}
                onProductUpdated={handleProductUpdated}
                suppliers={suppliers}
                categories={categories}
            />

            {/* Add Category Modal */}
            <AddCategoryModal
                isOpen={isAddCategoryOpen}
                onClose={onAddCategoryClose}
                onCategoryAdded={handleCategoryAdded}
            />

            {/* Stock Update Modal */}
            <Modal isOpen={isStockUpdateOpen} onClose={onStockUpdateClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
                <ModalContent borderRadius="2xl" boxShadow="2xl">
                    <ModalHeader>
                        <HStack spacing={3}>
                            <Box
                                w="10"
                                h="10"
                                bg="blue.100"
                                borderRadius="xl"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <EditIcon color="blue.500" />
                            </Box>
                            <Box>
                                <Text fontSize="xl" fontWeight="bold">Update Stock</Text>
                                <Text fontSize="sm" color="gray.500">
                                    {stockUpdateProduct?.name}
                                </Text>
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Box
                                bg="gray.50"
                                p={4}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <Text fontSize="sm" color="gray.600">
                                    Current Stock: <strong>{stockUpdateProduct?.quantity}</strong>
                                </Text>
                            </Box>
                            
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                    Operation
                                </Text>
                                <Select
                                    value={stockOperation}
                                    onChange={(e) => setStockOperation(e.target.value)}
                                    borderRadius="xl"
                                >
                                    <option value="set">Set to specific amount</option>
                                    <option value="add">Add to current stock</option>
                                    <option value="subtract">Subtract from current stock</option>
                                </Select>
                            </Box>
                            
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                    Quantity
                                </Text>
                                <NumberInput
                                    value={stockQuantity}
                                    onChange={(value) => setStockQuantity(Number(value))}
                                    min={0}
                                >
                                    <NumberInputField borderRadius="xl" />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <Box px={6} py={4} bg="gray.50" borderBottomRadius="2xl">
                        <HStack spacing={3} justify="end">
                            <Button onClick={onStockUpdateClose} variant="outline" borderRadius="xl">
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleStockUpdateConfirm}
                                borderRadius="xl"
                            >
                                Update Stock
                            </Button>
                        </HStack>
                    </Box>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Product
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete <strong>{deleteProduct?.name}</strong>? 
                            This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default InventoryManagement;