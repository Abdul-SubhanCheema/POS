import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Spacer,
    IconButton,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Textarea,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    InputGroup,
    InputLeftElement,
    Tooltip
} from '@chakra-ui/react';
import {
    AddIcon,
    SearchIcon,
    ViewIcon,
    EditIcon,
    WarningIcon,
    TimeIcon,
    CheckCircleIcon,
    InfoIcon
} from '@chakra-ui/icons';
import { MdAttachMoney } from 'react-icons/md';
import ReactSelect from 'react-select';
import recoveryService from '../services/recoveryService';
import customerService from '../services/customerService';

const RecoveryManagement = () => {
    const [outstandingSales, setOutstandingSales] = useState([]);
    const [overdueSales, setOverdueSales] = useState([]);
    const [fullyPaidSales, setFullyPaidSales] = useState([]);
    const [recentRecoveries, setRecentRecoveries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isAddRecoveryModalOpen, setIsAddRecoveryModalOpen] = useState(false);
    const [isViewHistoryModalOpen, setIsViewHistoryModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [recoveryHistory, setRecoveryHistory] = useState([]);
    
    // Recovery form state
    const [recoveryForm, setRecoveryForm] = useState({
        recoveryAmount: 0,
        paymentMethod: 'cash',
        paymentReference: '',
        notes: '',
        receivedBy: ''
    });

    const toast = useToast();

    // Helper functions
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const calculateOutstandingAmount = (sale) => {
        // If outstandingAmount exists, use it (backend should be consistent now)
        if (typeof sale.outstandingAmount === 'number') {
            return sale.outstandingAmount;
        }
        // For old records, calculate from grandTotal and payments
        const totalPaid = (sale.amountPaid || 0) + (sale.totalRecovered || 0);
        return Math.max(0, (sale.grandTotal || 0) - totalPaid);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [dashboardRes, outstandingRes, overdueRes, fullyPaidRes, recoveriesRes, customersRes] = await Promise.all([
                recoveryService.getRecoveryDashboardSummary(),
                recoveryService.getOutstandingSales(),
                recoveryService.getOverdueSales(),
                recoveryService.getFullyPaidSales(),
                recoveryService.getAllRecoveries(1, 1000), // Fetch up to 1000 recoveries
                customerService.getAllCustomers()
            ]);

            if (dashboardRes.success) {
                setDashboardSummary(dashboardRes.data);
            }

            // Set recent recoveries from separate API call (not limited to 10)
            if (recoveriesRes.success) {
                setRecentRecoveries(recoveriesRes.data || []);
            }

            if (outstandingRes.success) {
                setOutstandingSales(outstandingRes.data);
            }

            if (overdueRes.success) {
                setOverdueSales(overdueRes.data);
            }

            if (fullyPaidRes.success) {
                setFullyPaidSales(fullyPaidRes.data);
            }

            if (customersRes.success) {
                setCustomers(customersRes.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load recovery data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshData = async () => {
        setRefreshLoading(true);
        try {
            await fetchInitialData();
            toast({
                title: "Data Refreshed",
                description: "Recovery data has been updated successfully",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setRefreshLoading(false);
        }
    };

    const handleCustomerFilter = async (customer) => {
        setSelectedCustomer(customer);
        if (customer) {
            setLoading(true);
            try {
                const response = await recoveryService.getOutstandingSales(customer.value);
                if (response.success) {
                    setOutstandingSales(response.data);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to filter by customer",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        } else {
            fetchInitialData();
        }
    };

    const openAddRecoveryModal = (sale) => {
        const outstandingAmount = calculateOutstandingAmount(sale);
        setSelectedSale(sale);
        setRecoveryForm({
            recoveryAmount: outstandingAmount,
            paymentMethod: 'cash',
            paymentReference: '',
            notes: '',
            receivedBy: ''
        });
        setIsAddRecoveryModalOpen(true);
    };

    const handleAddRecovery = async () => {
        if (!selectedSale || !recoveryForm.receivedBy) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setRecoveryLoading(true);

        try {
            const recoveryData = {
                customerId: selectedSale.customer._id,
                saleId: selectedSale._id,
                ...recoveryForm
            };

            const response = await recoveryService.addRecovery(recoveryData);
            
            if (response.success) {
                toast({
                    title: "Success",
                    description: `Recovery payment of $${recoveryForm.recoveryAmount} recorded successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                
                setIsAddRecoveryModalOpen(false);
                // Immediate refresh, then a second refresh after delay to ensure data consistency
                await fetchInitialData();
                setTimeout(async () => {
                    await fetchInitialData();
                }, 1000);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to record recovery payment",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record recovery payment",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setRecoveryLoading(false);
        }
    };

    const viewRecoveryHistory = async (sale) => {
        setSelectedSale(sale);
        try {
            const response = await recoveryService.getSaleRecoveryHistory(sale._id);
            if (response.success) {
                setRecoveryHistory(response.data);
                setIsViewHistoryModalOpen(true);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load recovery history",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'fully_paid': return 'green';
            case 'partially_paid': return 'yellow';
            case 'unpaid': return 'red';
            case 'overdue': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'fully_paid': return 'Fully Paid';
            case 'partially_paid': return 'Partially Paid';
            case 'unpaid': return 'Unpaid';
            case 'overdue': return 'Overdue';
            default: return status;
        }
    };

    const customerOptions = customers.map(customer => ({
        value: customer._id,
        label: customer.name,
        customer: customer
    }));

    const filteredOutstandingSales = outstandingSales.filter(sale => 
        !searchTerm || 
        sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={6}>
            {/* Header */}
            <Flex mb={6} align="center">
                <HStack spacing={3}>
                    <Box
                        w="12"
                        h="12"
                        bg="purple.100"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <MdAttachMoney size="32px" color="purple" />
                    </Box>
                    <Box>
                        <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                            Recovery Management
                        </Text>
                        <Text color="gray.600">
                            Track customer payments and outstanding amounts
                        </Text>
                    </Box>
                </HStack>
            </Flex>

            {/* Dashboard Summary */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Outstanding</StatLabel>
                            <StatNumber color="red.500">
                                {formatCurrency(filteredOutstandingSales.reduce((sum, sale) => sum + calculateOutstandingAmount(sale), 0))}
                            </StatNumber>
                            <StatHelpText>
                                <WarningIcon color="red.500" mr={1} />
                                {filteredOutstandingSales.length} sales
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Overdue Sales</StatLabel>
                            <StatNumber color="red.600">
                                {overdueSales.length}
                            </StatNumber>
                            <StatHelpText>
                                <TimeIcon color="red.600" mr={1} />
                                {formatCurrency(overdueSales.reduce((sum, sale) => sum + calculateOutstandingAmount(sale), 0))}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Partially Paid</StatLabel>
                            <StatNumber color="yellow.500">
                                {filteredOutstandingSales.filter(sale => sale.recoveryStatus === 'partially_paid').length}
                            </StatNumber>
                            <StatHelpText>
                                <InfoIcon color="yellow.500" mr={1} />
                                Partial payments
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Fully Paid</StatLabel>
                            <StatNumber color="green.500">
                                {fullyPaidSales.length}
                            </StatNumber>
                            <StatHelpText>
                                <CheckCircleIcon color="green.500" mr={1} />
                                Completed sales
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card mb={6}>
                <CardBody>
                    <HStack spacing={4} align="end">
                        <FormControl maxW="300px">
                            <FormLabel fontSize="sm">Filter by Customer</FormLabel>
                            <ReactSelect
                                value={selectedCustomer}
                                onChange={handleCustomerFilter}
                                options={customerOptions}
                                placeholder="All customers..."
                                isClearable
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '40px'
                                    })
                                }}
                            />
                        </FormControl>

                        <FormControl maxW="300px">
                            <FormLabel fontSize="sm">Search Sales</FormLabel>
                            <InputGroup>
                                <InputLeftElement>
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search by customer or sale number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl maxW="150px">
                            <FormLabel fontSize="sm" opacity={0}>Actions</FormLabel>
                            <Button
                                onClick={handleRefreshData}
                                isLoading={refreshLoading}
                                loadingText="Refreshing..."
                                colorScheme="teal"
                                variant="outline"
                                w="full"
                                h="40px"
                            >
                                Refresh Data
                            </Button>
                        </FormControl>


                    </HStack>
                </CardBody>
            </Card>

            {/* Tabs for different views */}
            <Tabs variant="enclosed" colorScheme="purple">
                <TabList>
                    <Tab>Outstanding Sales ({filteredOutstandingSales.length})</Tab>
                    <Tab>Overdue Sales ({overdueSales.length})</Tab>
                    <Tab>Fully Paid Sales ({fullyPaidSales.length})</Tab>
                    <Tab>Recent Recoveries ({recentRecoveries.length})</Tab>
                </TabList>

                <TabPanels>
                    {/* Outstanding Sales Tab */}
                    <TabPanel p={0} pt={6}>
                        <Card>
                            <CardHeader>
                                <Text fontSize="lg" fontWeight="bold">Outstanding Sales</Text>
                            </CardHeader>
                            <CardBody>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Sale #</Th>
                                                <Th>Customer</Th>
                                                <Th>Sale Date</Th>
                                                <Th>Total Amount</Th>
                                                <Th>Paid Amount</Th>
                                                <Th>Outstanding</Th>
                                                <Th>Status</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredOutstandingSales.map((sale) => (
                                                <Tr key={sale._id}>
                                                    <Td fontWeight="semibold">{sale.saleNumber}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="semibold">{sale.customer.name}</Text>
                                                            <Text fontSize="sm" color="gray.500">{sale.customer.phone}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>{formatDate(sale.saleDate)}</Td>
                                                    <Td fontWeight="bold">{formatCurrency(sale.grandTotal)}</Td>
                                                    <Td color="green.600">{formatCurrency(sale.amountPaid + (sale.totalRecovered || 0))}</Td>
                                                    <Td color="red.600" fontWeight="bold">{formatCurrency(calculateOutstandingAmount(sale))}</Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(sale.recoveryStatus)}>
                                                            {getStatusLabel(sale.recoveryStatus)}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Tooltip label="Add Recovery Payment">
                                                                <IconButton
                                                                    icon={<AddIcon />}
                                                                    size="sm"
                                                                    colorScheme="green"
                                                                    variant="ghost"
                                                                    onClick={() => openAddRecoveryModal(sale)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip label="View Recovery History">
                                                                <IconButton
                                                                    icon={<ViewIcon />}
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    onClick={() => viewRecoveryHistory(sale)}
                                                                />
                                                            </Tooltip>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {filteredOutstandingSales.length === 0 && (
                                    <Box textAlign="center" py={10}>
                                        <Text color="gray.500" fontSize="lg">
                                            No outstanding sales found
                                        </Text>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Overdue Sales Tab */}
                    <TabPanel p={0} pt={6}>
                        <Card>
                            <CardHeader>
                                <HStack>
                                    <WarningIcon color="red.500" />
                                    <Text fontSize="lg" fontWeight="bold" color="red.600">Overdue Sales</Text>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                {overdueSales.length > 0 && (
                                    <Alert status="warning" borderRadius="md" mb={4}>
                                        <AlertIcon />
                                        <AlertTitle>Attention Required!</AlertTitle>
                                        <AlertDescription>
                                            {overdueSales.length} sales are overdue with total outstanding of {formatCurrency(overdueSales.reduce((sum, sale) => sum + calculateOutstandingAmount(sale), 0))}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Sale #</Th>
                                                <Th>Customer</Th>
                                                <Th>Due Date</Th>
                                                <Th>Days Overdue</Th>
                                                <Th>Outstanding</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {overdueSales.map((sale) => {
                                                const daysOverdue = Math.floor((new Date() - new Date(sale.dueDate)) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <Tr key={sale._id} bg="red.50">
                                                        <Td fontWeight="semibold">{sale.saleNumber}</Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="semibold">{sale.customer.name}</Text>
                                                                <Text fontSize="sm" color="gray.500">{sale.customer.phone}</Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td color="red.600">{formatDate(sale.dueDate)}</Td>
                                                        <Td>
                                                            <Badge colorScheme="red">
                                                                {daysOverdue} days
                                                            </Badge>
                                                        </Td>
                                                        <Td color="red.600" fontWeight="bold">{formatCurrency(calculateOutstandingAmount(sale))}</Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    leftIcon={<AddIcon />}
                                                                    onClick={() => openAddRecoveryModal(sale)}
                                                                >
                                                                    Urgent Recovery
                                                                </Button>
                                                                <IconButton
                                                                    icon={<ViewIcon />}
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    onClick={() => viewRecoveryHistory(sale)}
                                                                />
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {overdueSales.length === 0 && (
                                    <Box textAlign="center" py={10}>
                                        <CheckCircleIcon color="green.500" boxSize={12} mb={4} />
                                        <Text color="gray.500" fontSize="lg">
                                            No overdue sales - Great job!
                                        </Text>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Fully Paid Sales Tab */}
                    <TabPanel p={0} pt={6}>
                        <Card>
                            <CardHeader>
                                <HStack>
                                    <CheckCircleIcon color="green.500" />
                                    <Text fontSize="lg" fontWeight="bold" color="green.600">Fully Paid Sales</Text>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Sale #</Th>
                                                <Th>Customer</Th>
                                                <Th>Sale Date</Th>
                                                <Th>Total Amount</Th>
                                                <Th>Paid Amount</Th>
                                                <Th>Status</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {fullyPaidSales.map((sale) => (
                                                <Tr key={sale._id} bg="green.50">
                                                    <Td fontWeight="semibold">{sale.saleNumber}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="semibold">{sale.customer.name}</Text>
                                                            <Text fontSize="sm" color="gray.500">{sale.customer.phone}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>{formatDate(sale.saleDate)}</Td>
                                                    <Td fontWeight="bold">{formatCurrency(sale.grandTotal)}</Td>
                                                    <Td color="green.600" fontWeight="bold">{formatCurrency(sale.amountPaid + (sale.totalRecovered || 0))}</Td>
                                                    <Td>
                                                        <Badge colorScheme="green">
                                                            Fully Paid
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Tooltip label="View Payment History">
                                                            <IconButton
                                                                icon={<ViewIcon />}
                                                                size="sm"
                                                                colorScheme="blue"
                                                                variant="ghost"
                                                                onClick={() => viewRecoveryHistory(sale)}
                                                            />
                                                        </Tooltip>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {fullyPaidSales.length === 0 && (
                                    <Box textAlign="center" py={10}>
                                        <Text color="gray.500" fontSize="lg">
                                            No fully paid sales found
                                        </Text>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Recent Recoveries Tab */}
                    <TabPanel p={0} pt={6}>
                        <Card>
                            <CardHeader>
                                <Text fontSize="lg" fontWeight="bold">Recent Recovery Payments</Text>
                            </CardHeader>
                            <CardBody>
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Sale #</Th>
                                                <Th>Customer</Th>
                                                <Th>Amount</Th>
                                                <Th>Payment Method</Th>
                                                <Th>Received By</Th>
                                                <Th>Notes</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {recentRecoveries.map((recovery) => (
                                                <Tr key={recovery._id}>
                                                    <Td>{formatDate(recovery.recoveryDate)}</Td>
                                                    <Td fontWeight="semibold">{recovery.saleNumber}</Td>
                                                    <Td>{recovery.customer?.name}</Td>
                                                    <Td color="green.600" fontWeight="bold">{formatCurrency(recovery.recoveryAmount)}</Td>
                                                    <Td>
                                                        <Badge colorScheme="blue">
                                                            {recovery.paymentMethod}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{recovery.receivedBy}</Td>
                                                    <Td>{recovery.notes || '-'}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {recentRecoveries.length === 0 && (
                                    <Box textAlign="center" py={10}>
                                        <Text color="gray.500" fontSize="lg">
                                            No recent recovery payments
                                        </Text>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Add Recovery Modal */}
            <Modal isOpen={isAddRecoveryModalOpen} onClose={() => setIsAddRecoveryModalOpen(false)} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Add Recovery Payment
                        {selectedSale && (
                            <Text fontSize="sm" color="gray.600" fontWeight="normal">
                                Sale #{selectedSale.saleNumber} - {selectedSale.customer.name}
                            </Text>
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            {selectedSale && (
                                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Stat>
                                            <StatLabel>Total Amount</StatLabel>
                                            <StatNumber fontSize="lg">{formatCurrency(selectedSale.grandTotal)}</StatNumber>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>Outstanding</StatLabel>
                                            <StatNumber fontSize="lg" color="red.500">{formatCurrency(calculateOutstandingAmount(selectedSale))}</StatNumber>
                                        </Stat>
                                    </SimpleGrid>
                                </Box>
                            )}

                            <FormControl isRequired>
                                <FormLabel>Recovery Amount</FormLabel>
                                <NumberInput
                                    value={recoveryForm.recoveryAmount}
                                    onChange={(value) => setRecoveryForm({...recoveryForm, recoveryAmount: parseFloat(value) || 0})}
                                    min={0}
                                    max={selectedSale ? calculateOutstandingAmount(selectedSale) : 0}
                                    precision={2}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Payment Method</FormLabel>
                                <Select
                                    value={recoveryForm.paymentMethod}
                                    onChange={(e) => setRecoveryForm({...recoveryForm, paymentMethod: e.target.value})}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Payment Reference</FormLabel>
                                <Input
                                    value={recoveryForm.paymentReference}
                                    onChange={(e) => setRecoveryForm({...recoveryForm, paymentReference: e.target.value})}
                                    placeholder="Cheque number, transaction ID, etc."
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Received By</FormLabel>
                                <Input
                                    value={recoveryForm.receivedBy}
                                    onChange={(e) => setRecoveryForm({...recoveryForm, receivedBy: e.target.value})}
                                    placeholder="Staff member name"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Textarea
                                    value={recoveryForm.notes}
                                    onChange={(e) => setRecoveryForm({...recoveryForm, notes: e.target.value})}
                                    placeholder="Additional notes about this payment"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="ghost" 
                            mr={3} 
                            onClick={() => setIsAddRecoveryModalOpen(false)}
                            isDisabled={recoveryLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="green" 
                            onClick={handleAddRecovery}
                            isLoading={recoveryLoading}
                            loadingText="Recording Payment..."
                        >
                            Record Payment
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Recovery History Modal */}
            <Modal isOpen={isViewHistoryModalOpen} onClose={() => setIsViewHistoryModalOpen(false)} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Recovery History
                        {selectedSale && (
                            <Text fontSize="sm" color="gray.600" fontWeight="normal">
                                Sale #{selectedSale.saleNumber} - {selectedSale.customer.name}
                            </Text>
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {recoveryHistory.length > 0 ? (
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Amount</Th>
                                            <Th>Method</Th>
                                            <Th>Received By</Th>
                                            <Th>Notes</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {recoveryHistory.map((recovery) => (
                                            <Tr key={recovery._id}>
                                                <Td>{formatDate(recovery.recoveryDate)}</Td>
                                                <Td color="green.600" fontWeight="bold">{formatCurrency(recovery.recoveryAmount)}</Td>
                                                <Td>
                                                    <Badge colorScheme="blue">{recovery.paymentMethod}</Badge>
                                                </Td>
                                                <Td>{recovery.receivedBy}</Td>
                                                <Td fontSize="sm">{recovery.notes || '-'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box textAlign="center" py={8}>
                                <InfoIcon color="gray.400" boxSize={12} mb={4} />
                                <Text color="gray.500">No recovery payments recorded for this sale</Text>
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setIsViewHistoryModalOpen(false)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RecoveryManagement;