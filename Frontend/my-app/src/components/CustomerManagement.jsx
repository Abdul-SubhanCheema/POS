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
    Card,
    CardHeader,
    CardBody,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
} from '@chakra-ui/react';
import {
    SearchIcon,
    AddIcon,
    EditIcon,
    DeleteIcon,
    PhoneIcon,
    EmailIcon,
    ChevronDownIcon,
} from '@chakra-ui/icons';
import { FaUsers } from 'react-icons/fa';
import customerService from '../services/customerService';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';

const CustomerManagement = () => {
    const [allCustomers, setAllCustomers] = useState([]); // Store all customers
    const [customers, setCustomers] = useState([]); // Store filtered customers
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const toast = useToast();
    
    // Modal controls
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    // Fetch customers on component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Real-time filtering effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setCustomers(allCustomers);
        } else {
            // Add a small debounce for better performance with large datasets
            const timeoutId = setTimeout(() => {
                const filtered = allCustomers.filter(customer => 
                    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setCustomers(filtered);
            }, 150); // 150ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, allCustomers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getAllCustomers();
            if (response.success) {
                setAllCustomers(response.data);
                setCustomers(response.data);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to fetch customers",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch customers",
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

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        onEditOpen();
    };

    const handleToggleStatus = async (customer) => {
        try {
            const response = await customerService.toggleCustomerStatus(customer._id);
            if (response.success) {
                const newStatus = customer.status === 'active' ? 'inactive' : 'active';
                toast({
                    title: "Success",
                    description: `Customer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchCustomers();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update customer status",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update customer status",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };



    const handleCustomerAdded = () => {
        fetchCustomers();
        onAddClose();
    };

    const handleCustomerUpdated = () => {
        fetchCustomers();
        onEditClose();
    };

    if (loading && customers.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" />
                    <Text>Loading customers...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Modern Header Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" mb={6} overflow="hidden">
                <Box
                    bgGradient="linear(135deg, brand.500 0%, purple.500 100%)"
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
                                    <FaUsers fontSize="32px" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="xl" fontWeight="bold">
                                        Customer Management
                                    </Heading>
                                    <Text color="whiteAlpha.900" fontSize="md">
                                        Manage customer relationships and information
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
                            Add New Customer
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
                                    placeholder="Search customers by name... (live filtering)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    borderRadius="xl"
                                    bg="white"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    focusBorderColor="brand.500"
                                    _hover={{ borderColor: 'brand.300' }}
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
                                    bg="brand.100"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    border="2px solid"
                                    borderColor="brand.200"
                                >
                                    <HStack spacing={2}>
                                        <Box w="3" h="3" bg="brand.500" borderRadius="full" />
                                        <Text fontSize="sm" fontWeight="semibold" color="brand.700">
                                            Total Customers: {allCustomers.length}
                                        </Text>
                                    </HStack>
                                </Box>
                                {searchQuery && (
                                    <Box
                                        bg="purple.100"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                        border="2px solid"
                                        borderColor="purple.200"
                                    >
                                        <HStack spacing={2}>
                                            <SearchIcon w="3" h="3" color="purple.500" />
                                            <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                                                Filtered Results: {customers.length}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                                {searchQuery && customers.length > 0 && (
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

            {/* Customer Table Section */}
            <Box bg="white" borderRadius="2xl" boxShadow="lg" overflow="hidden">
                <Box px={8} py={8}>
                    {customers.length === 0 ? (
                        <Box textAlign="center" py={16} mt={8}>
                            <VStack spacing={8}>
                                <Box
                                    w="24"
                                    h="24"
                                    bg="gray.100"
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    border="3px solid"
                                    borderColor="gray.200"
                                >
                                    <FaUsers fontSize="64px" color="var(--chakra-colors-gray-400)" />
                                </Box>
                                <Box maxW="md">
                                    <Heading size="lg" color="gray.600" mb={4}>
                                        {searchQuery ? 'No customers found' : 'No customers yet'}
                                    </Heading>
                                    <Text color="gray.500" fontSize="md" lineHeight="1.6">
                                        {searchQuery 
                                            ? 'Try adjusting your search terms or add a new customer to get started.' 
                                            : 'Start building your customer base by adding your first customer to the system.'}
                                    </Text>
                                </Box>
                                {!searchQuery && (
                                    <Button
                                        leftIcon={<AddIcon />}
                                        colorScheme="brand"
                                        onClick={onAddOpen}
                                        size="lg"
                                        borderRadius="xl"
                                        px={10}
                                        py={6}
                                        fontSize="md"
                                        fontWeight="semibold"
                                        mt={4}
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 10px 25px rgba(66, 153, 225, 0.3)"
                                        }}
                                        boxShadow="0 4px 12px rgba(66, 153, 225, 0.2)"
                                    >
                                        Add First Customer
                                    </Button>
                                )}
                            </VStack>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table variant="simple" size="lg">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Customer</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Contact</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Address</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Status</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Joined</Th>
                                        <Th fontSize="sm" fontWeight="bold" color="gray.700" py={4}>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {customers.map((customer, index) => (
                                        <Tr 
                                            key={customer._id}
                                            _hover={{ bg: "gray.50", transform: "scale(1.01)" }}
                                            transition="all 0.2s"
                                            borderLeft="4px solid transparent"
                                            _hoverselected={{ borderLeftColor: "brand.500" }}
                                        >
                                            <Td py={6}>
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        name={customer.name}
                                                        bg="brand.500"
                                                        color="white"
                                                        fontWeight="bold"
                                                        border="3px solid"
                                                        borderColor="gray.200"
                                                    />
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                                                            {customer.name}
                                                        </Text>
                                                        {customer.email && (
                                                            <Text fontSize="sm" color="gray.500">
                                                                {customer.email}
                                                            </Text>
                                                        )}
                                                        <Badge 
                                                            colorScheme={index % 2 === 0 ? "blue" : "green"} 
                                                            size="sm" 
                                                            borderRadius="full"
                                                            variant="subtle"
                                                        >
                                                            Customer #{index + 1}
                                                        </Badge>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td py={6}>
                                                <VStack align="start" spacing={2}>
                                                    <HStack spacing={3}>
                                                        <Box
                                                            w="8"
                                                            h="8"
                                                            bg="green.100"
                                                            borderRadius="lg"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <PhoneIcon w={4} h={4} color="green.600" />
                                                        </Box>
                                                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                                            {customer.phone}
                                                        </Text>
                                                    </HStack>
                                                    {customer.email && (
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
                                                                <EmailIcon w={4} h={4} color="blue.600" />
                                                            </Box>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {customer.email}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </VStack>
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
                                                        {customer.address}
                                                    </Text>
                                                </Box>
                                            </Td>
                                            <Td py={6}>
                                                <Badge
                                                    colorScheme={customer.status === 'active' ? 'green' : 'red'}
                                                    variant="subtle"
                                                    fontSize="xs"
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                >
                                                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </Td>
                                            <Td py={6}>
                                                <VStack align="start" spacing={1}>
                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                                            weekday: 'long'
                                                        })}
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td py={6}>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        aria-label="Edit Customer"
                                                        size="sm"
                                                        colorScheme="green"
                                                        variant="ghost"
                                                        borderRadius="lg"
                                                        onClick={() => handleEdit(customer)}
                                                        _hover={{
                                                            bg: "green.100",
                                                            transform: "scale(1.1)"
                                                        }}
                                                    />
                                                    <IconButton
                                                        icon={<DeleteIcon />}
                                                        aria-label={customer.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                                                        size="sm"
                                                        colorScheme={customer.status === 'active' ? 'red' : 'green'}
                                                        variant="ghost"
                                                        borderRadius="lg"
                                                        onClick={() => handleToggleStatus(customer)}
                                                        _hover={{
                                                            bg: customer.status === 'active' ? "red.100" : "green.100",
                                                            transform: "scale(1.1)"
                                                        }}
                                                    />
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

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={isAddOpen}
                onClose={onAddClose}
                onCustomerAdded={handleCustomerAdded}
            />

            {/* Edit Customer Modal */}
            <EditCustomerModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                customer={selectedCustomer}
                onCustomerUpdated={handleCustomerUpdated}
            />


        </Box>
    );
};

export default CustomerManagement;