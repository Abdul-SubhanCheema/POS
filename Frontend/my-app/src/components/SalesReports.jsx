import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Select,
    Button,
    ButtonGroup,
    Flex,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useColorModeValue,
    Icon,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Divider
} from '@chakra-ui/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiUsers, FiCalendar, FiBarChart } from 'react-icons/fi';
import saleService from '../services/saleService';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const SalesReports = () => {
    const [salesData, setSalesData] = useState(null);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days
    const [chartType, setChartType] = useState('daily');
    const toast = useToast();

    // Color scheme
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Fetch sales statistics and data
    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const [statisticsResponse, salesResponse] = await Promise.all([
                saleService.getSalesStatistics({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }),
                saleService.getAllSales({
                    page: 1,
                    limit: 10,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                })
            ]);

            if (statisticsResponse.success) {
                setSalesData(statisticsResponse.data);
            }

            if (salesResponse.success) {
                setRecentSales(salesResponse.data);
            }

        } catch (error) {
            console.error('Error fetching sales data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load sales data',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, [dateRange]);

    // Chart configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartType === 'daily' ? 'Daily Sales Trend' : 'Monthly Sales Overview',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    // Prepare chart data
    const getChartData = () => {
        if (!salesData?.dailySales) {
            return {
                labels: [],
                datasets: [{
                    label: 'Sales',
                    data: [],
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                }]
            };
        }

        const labels = salesData.dailySales.map(day => {
            const date = new Date(day._id);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const revenueData = salesData.dailySales.map(day => day.totalRevenue);
        const salesCountData = salesData.dailySales.map(day => day.totalSales);

        return {
            labels,
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: revenueData,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y',
                },
                {
                    label: 'Sales Count',
                    data: salesCountData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1',
                }
            ]
        };
    };

    // Top customers chart data
    const getTopCustomersChartData = () => {
        if (!salesData?.topCustomers || salesData.topCustomers.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#E2E8F0'],
                }]
            };
        }

        return {
            labels: salesData.topCustomers.map(customer => customer.customerInfo.name),
            datasets: [{
                data: salesData.topCustomers.map(customer => customer.totalSpent),
                backgroundColor: [
                    '#8B5CF6',
                    '#06B6D4',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444'
                ],
                borderColor: [
                    '#7C3AED',
                    '#0891B2',
                    '#059669',
                    '#D97706',
                    '#DC2626'
                ],
                borderWidth: 2,
            }]
        };
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Top Customers by Revenue'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': $' + context.parsed.toLocaleString();
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <Box p={8} bg={bgColor} minH="100vh">
                <VStack spacing={4}>
                    <Spinner size="xl" color="purple.500" />
                    <Text>Loading sales analytics...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box p={8} bg={bgColor} minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <VStack align="start" spacing={2}>
                        <Heading size="lg" color="purple.600">
                            <Icon as={FiBarChart} mr={3} />
                            Sales Analytics & Reports
                        </Heading>
                        <Text color="gray.600">
                            Comprehensive overview of your sales performance
                        </Text>
                    </VStack>

                    <HStack spacing={4}>
                        <Select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            w="200px"
                            bg={cardBg}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 3 months</option>
                            <option value="365">Last year</option>
                        </Select>
                        <Button
                            onClick={fetchSalesData}
                            colorScheme="purple"
                            variant="outline"
                        >
                            Refresh
                        </Button>
                    </HStack>
                </Flex>

                {/* Key Metrics Cards */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' }} gap={6}>
                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Total Revenue</StatLabel>
                                        <StatNumber color="purple.600">
                                            ${salesData?.totalRevenue?.toLocaleString() || '0'}
                                        </StatNumber>
                                        <StatHelpText>
                                            <StatArrow type="increase" />
                                            Last {dateRange} days
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiDollarSign} w={8} h={8} color="purple.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Total Sales</StatLabel>
                                        <StatNumber color="green.600">
                                            {salesData?.totalSales || 0}
                                        </StatNumber>
                                        <StatHelpText>
                                            <StatArrow type="increase" />
                                            Transactions
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiShoppingCart} w={8} h={8} color="green.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Average Sale</StatLabel>
                                        <StatNumber color="blue.600">
                                            ${salesData?.avgSaleValue?.toFixed(2) || '0.00'}
                                        </StatNumber>
                                        <StatHelpText>
                                            Per transaction
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiTrendingUp} w={8} h={8} color="blue.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Active Customers</StatLabel>
                                        <StatNumber color="orange.600">
                                            {salesData?.topCustomers?.length || 0}
                                        </StatNumber>
                                        <StatHelpText>
                                            With purchases
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiUsers} w={8} h={8} color="orange.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Total Profit</StatLabel>
                                        <StatNumber color="teal.600">
                                            ${salesData?.totalProfit?.toLocaleString() || '0'}
                                        </StatNumber>
                                        <StatHelpText>
                                            <StatArrow type="increase" />
                                            Last {dateRange} days
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiTrendingUp} w={8} h={8} color="teal.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardBody>
                            <Stat>
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <StatLabel color="gray.600">Avg Profit Margin</StatLabel>
                                        <StatNumber color="cyan.600">
                                            {salesData?.avgProfitMargin?.toFixed(1) || '0.0'}%
                                        </StatNumber>
                                        <StatHelpText>
                                            Per transaction
                                        </StatHelpText>
                                    </Box>
                                    <Icon as={FiBarChart} w={8} h={8} color="cyan.500" />
                                </Flex>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Charts Section */}
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                    {/* Sales Trend Chart */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <Card bg={cardBg} borderColor={borderColor}>
                            <CardHeader>
                                <Flex justify="space-between" align="center">
                                    <Heading size="md">Sales Trend</Heading>
                                    <ButtonGroup size="sm" isAttached variant="outline">
                                        <Button
                                            onClick={() => setChartType('daily')}
                                            colorScheme={chartType === 'daily' ? 'purple' : 'gray'}
                                        >
                                            Daily
                                        </Button>
                                        <Button
                                            onClick={() => setChartType('monthly')}
                                            colorScheme={chartType === 'monthly' ? 'purple' : 'gray'}
                                        >
                                            Monthly
                                        </Button>
                                    </ButtonGroup>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <Box h="300px">
                                    <Line data={getChartData()} options={chartOptions} />
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Top Customers Chart */}
                    <GridItem>
                        <Card bg={cardBg} borderColor={borderColor}>
                            <CardHeader>
                                <Heading size="md">Top Customers</Heading>
                            </CardHeader>
                            <CardBody>
                                <Box h="300px">
                                    <Doughnut data={getTopCustomersChartData()} options={doughnutOptions} />
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>

                {/* Recent Sales Table */}
                <Card bg={cardBg} borderColor={borderColor}>
                    <CardHeader>
                        <Heading size="md">Recent Sales</Heading>
                    </CardHeader>
                    <CardBody>
                        {recentSales.length > 0 ? (
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Sale #</Th>
                                            <Th>Customer</Th>
                                            <Th>Date</Th>
                                            <Th>Items</Th>
                                            <Th>Total</Th>
                                            <Th>Profit</Th>
                                            <Th>Margin</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {recentSales.map((sale) => (
                                            <Tr key={sale._id}>
                                                <Td fontWeight="medium">{sale.saleNumber}</Td>
                                                <Td>{sale.customer?.name || 'Unknown'}</Td>
                                                <Td>{new Date(sale.saleDate).toLocaleDateString()}</Td>
                                                <Td>{sale.totalItems || sale.items?.length}</Td>
                                                <Td fontWeight="semibold" color="green.600">
                                                    ${sale.grandTotal?.toFixed(2) || '0.00'}
                                                </Td>
                                                <Td fontWeight="semibold" color="teal.600">
                                                    ${sale.totalProfit?.toFixed(2) || '0.00'}
                                                </Td>
                                                <Td fontWeight="medium" color="cyan.600">
                                                    {sale.profitMargin?.toFixed(1) || '0.0'}%
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={
                                                            sale.status === 'completed' ? 'green' :
                                                            sale.status === 'pending' ? 'yellow' : 'red'
                                                        }
                                                    >
                                                        {sale.status}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>No Sales Data!</AlertTitle>
                                    <AlertDescription>
                                        There are no sales records for the selected period. Process some sales to see analytics here.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}
                    </CardBody>
                </Card>

                {/* Top Customers Details */}
                {salesData?.topCustomers && salesData.topCustomers.length > 0 && (
                    <Card bg={cardBg} borderColor={borderColor}>
                        <CardHeader>
                            <Heading size="md">Top Customers Details</Heading>
                        </CardHeader>
                        <CardBody>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                                {salesData.topCustomers.map((customer, index) => (
                                    <Box key={customer._id} p={4} borderWidth="1px" borderRadius="lg">
                                        <VStack align="start" spacing={2}>
                                            <Flex align="center" justify="space-between" w="100%">
                                                <Text fontWeight="semibold" fontSize="lg">
                                                    {customer.customerInfo.name}
                                                </Text>
                                                <Badge colorScheme="purple">#{index + 1}</Badge>
                                            </Flex>
                                            <Text color="gray.600" fontSize="sm">
                                                {customer.customerInfo.email}
                                            </Text>
                                            <Divider />
                                            <HStack justify="space-between" w="100%">
                                                <Text fontSize="sm" color="gray.600">Total Spent:</Text>
                                                <Text fontWeight="bold" color="green.600">
                                                    ${customer.totalSpent.toFixed(2)}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between" w="100%">
                                                <Text fontSize="sm" color="gray.600">Total Orders:</Text>
                                                <Text fontWeight="bold" color="blue.600">
                                                    {customer.totalSales}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between" w="100%">
                                                <Text fontSize="sm" color="gray.600">Avg Order:</Text>
                                                <Text fontWeight="bold" color="purple.600">
                                                    ${(customer.totalSpent / customer.totalSales).toFixed(2)}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                ))}
                            </Grid>
                        </CardBody>
                    </Card>
                )}
            </VStack>
        </Box>
    );
};

export default SalesReports;