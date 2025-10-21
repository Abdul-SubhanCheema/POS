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
} from '@chakra-ui/react';
import {
    SearchIcon,
    AddIcon,
    EditIcon,
    PhoneIcon,
} from '@chakra-ui/icons';
import { FaIndustry } from 'react-icons/fa';
import supplierService from '../services/supplierService';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';

const SupplierManagement = () => {
    const [allSuppliers, setAllSuppliers] = useState([]); // Store all suppliers
    const [suppliers, setSuppliers] = useState([]); // Store filtered suppliers
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    // Removed deleteSupplier state as we're using status toggle instead
    
    const toast = useToast();
    
    // Modal controls
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    // Fetch suppliers on component mount
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Real-time filtering effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuppliers(allSuppliers);
        } else {
            // Add a small debounce for better performance with large datasets
            const timeoutId = setTimeout(() => {
                const filtered = allSuppliers.filter(supplier => 
                    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSuppliers(filtered);
            }, 150); // 150ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, allSuppliers]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await supplierService.getAllSuppliers();
            if (response.success) {
                setAllSuppliers(response.data);
                setSuppliers(response.data);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to fetch suppliers",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch suppliers",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        onEditOpen();
    };

    const handleStatusToggle = async (supplier) => {
        try {
            const response = await supplierService.toggleSupplierStatus(supplier._id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `Supplier ${response.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchSuppliers();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update supplier status",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update supplier status",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSupplierAdded = () => {
        fetchSuppliers();
        onAddClose();
    };

    const handleSupplierUpdated = () => {
        fetchSuppliers();
        onEditClose();
    };

    if (loading && suppliers.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="secondary.500" />
                    <Text>Loading suppliers...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Modern Header Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" mb={6} overflow="hidden">
                <Box
                    bgGradient="linear(135deg, secondary.500 0%, orange.500 100%)"
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
                                    <FaIndustry size="32px" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="xl" fontWeight="bold">
                                        Supplier Management
                                    </Heading>
                                    <Text color="whiteAlpha.900" fontSize="md">
                                        Manage your suppliers and vendor relationships
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>
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
                            ml={8}
                            mr={4}
                        >
                            Add New Supplier
                        </Button>
                    </Flex>
                </Box>

                {/* Search and Filter Section */}
                <Box px={8} py={6} bg="gray.50">
                    <VStack spacing={4} align="stretch">
                        <HStack spacing={4} justify="space-between">
                            <InputGroup maxW="500px" size="lg">
                                <InputLeftElement pointerEvents="none" h="full">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search suppliers by name... (live filtering)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    borderRadius="xl"
                                    bg="white"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="secondary.500"
                                    _hover={{ borderColor: 'secondary.300' }}
                                    fontSize="md"
                                />
                            </InputGroup>
                            
                            {searchQuery && (
                                <Button 
                                    onClick={clearSearch} 
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
                                    Clear Search
                                </Button>
                            )}
                        </HStack>

                        {/* Enhanced Stats */}
                        <HStack spacing={6} justify="space-between">
                            <HStack spacing={4}>
                                <Box
                                    bg="secondary.100"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    border="2px solid"
                                    borderColor="secondary.200"
                                >
                                    <HStack spacing={2}>
                                        <Box w="3" h="3" bg="secondary.500" borderRadius="full" />
                                        <Text fontSize="sm" fontWeight="semibold" color="secondary.700">
                                            Total Suppliers: {allSuppliers.length}
                                        </Text>
                                    </HStack>
                                </Box>
                                {searchQuery && (
                                    <Box
                                        bg="orange.100"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                        border="2px solid"
                                        borderColor="orange.200"
                                    >
                                        <HStack spacing={2}>
                                            <SearchIcon w="3" h="3" color="orange.500" />
                                            <Text fontSize="sm" fontWeight="semibold" color="orange.700">
                                                Filtered Results: {suppliers.length}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                                {searchQuery && suppliers.length > 0 && (
                                    <Box
                                        bg="green.100"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                        border="2px solid"
                                        borderColor="green.200"
                                    >
                                        <HStack spacing={2}>
                                            <Box w="3" h="3" bg="green.500" borderRadius="full" />
                                            <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                                Live Search Active
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                            </HStack>
                        </HStack>
                    </VStack>
                </Box>
            </Box>

            {/* Supplier Table Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" overflow="hidden">
                <Box px={8} py={8}>
                    {suppliers.length === 0 ? (
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
                                    <FaIndustry size="80px" color="var(--chakra-colors-gray-400)" />
                                </Box>
                                <Box maxW="lg" px={6}>
                                    <Heading size="xl" color="gray.700" mb={6}>
                                        {searchQuery ? 'No suppliers found' : 'No suppliers yet'}
                                    </Heading>
                                    <Text color="gray.600" fontSize="lg" lineHeight="1.8">
                                        {searchQuery 
                                            ? 'We couldn\'t find any suppliers matching your search. Try different keywords or add a new supplier.' 
                                            : 'Your supplier database is empty. Start building vendor relationships by adding your first supplier to the system.'}
                                    </Text>
                                </Box>
                                {!searchQuery && (
                                    <Button
                                        leftIcon={<AddIcon />}
                                        colorScheme="secondary"
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
                                            boxShadow: "0 15px 35px rgba(237, 137, 54, 0.4)"
                                        }}
                                        boxShadow="0 8px 20px rgba(237, 137, 54, 0.3)"
                                    >
                                        Add Your First Supplier
                                    </Button>
                                )}
                            </VStack>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table variant="simple" size="lg">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Supplier</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Contact</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Address</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Status</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Added</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {suppliers.map((supplier, index) => (
                                        <Tr 
                                            key={supplier._id}
                                            _hover={{ bg: "gray.50", transform: "scale(1.01)" }}
                                            transition="all 0.2s"
                                            borderLeft="4px solid transparent"
                                            _hoverselected={{ borderLeftColor: "secondary.500" }}
                                        >
                                            <Td py={6}>
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        name={supplier.name}
                                                        bg="secondary.500"
                                                        color="white"
                                                        fontWeight="bold"
                                                        border="3px solid"
                                                        borderColor="gray.200"
                                                    />
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                                                            {supplier.name}
                                                        </Text>
                                                        <Badge 
                                                            colorScheme={index % 2 === 0 ? "orange" : "yellow"} 
                                                            size="sm" 
                                                            borderRadius="full"
                                                            variant="subtle"
                                                        >
                                                            Supplier #{index + 1}
                                                        </Badge>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td py={6}>
                                                <HStack spacing={3}>
                                                    <Box
                                                        w="8"
                                                        h="8"
                                                        bg="secondary.100"
                                                        borderRadius="lg"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    >
                                                        <PhoneIcon w={4} h={4} color="secondary.600" />
                                                    </Box>
                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                                        {supplier.phone}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td py={6}>
                                                <Box
                                                    bg="gray.50"
                                                    px={3}
                                                    py={2}
                                                    borderRadius="lg"
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                >
                                                    <Text fontSize="sm" maxW="200px" isTruncated color="gray.700">
                                                        {supplier.address}
                                                    </Text>
                                                </Box>
                                            </Td>
                                            <Td py={6}>
                                                <Badge
                                                    colorScheme={supplier.status === 'active' ? 'green' : 'red'}
                                                    variant="solid"
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    textTransform="capitalize"
                                                >
                                                    {supplier.status || 'active'}
                                                </Badge>
                                            </Td>
                                            <Td py={6}>
                                                <VStack align="start" spacing={1}>
                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                                        {new Date(supplier.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {new Date(supplier.createdAt).toLocaleDateString('en-US', {
                                                            weekday: 'long'
                                                        })}
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td py={6}>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        aria-label="Edit Supplier"
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="ghost"
                                                        borderRadius="lg"
                                                        onClick={() => handleEdit(supplier)}
                                                        _hover={{
                                                            bg: "blue.100",
                                                            transform: "scale(1.1)"
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        colorScheme={supplier.status === 'active' ? 'red' : 'green'}
                                                        variant="solid"
                                                        borderRadius="lg"
                                                        onClick={() => handleStatusToggle(supplier)}
                                                        _hover={{
                                                            transform: "scale(1.05)"
                                                        }}
                                                        fontSize="xs"
                                                        px={3}
                                                    >
                                                        {supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </Button>
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

            {/* Add Supplier Modal */}
            <AddSupplierModal
                isOpen={isAddOpen}
                onClose={onAddClose}
                onSupplierAdded={handleSupplierAdded}
            />

            {/* Edit Supplier Modal */}
            <EditSupplierModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                supplier={selectedSupplier}
                onSupplierUpdated={handleSupplierUpdated}
            />


        </Box>
    );
};

export default SupplierManagement;