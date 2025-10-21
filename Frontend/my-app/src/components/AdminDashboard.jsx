import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Heading,
    Button,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    useColorModeValue,
    Badge,
    Container,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Divider,
    Progress,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Spinner,
    useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon, BellIcon, SettingsIcon, ChevronRightIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FaUsers, FaBoxes, FaDollarSign, FaChartBar, FaIndustry } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CustomerManagement from './CustomerManagement';
import SupplierManagement from './SupplierManagement';
import InventoryManagement from './InventoryManagement';
import customerService from '../services/customerService';
import supplierService from '../services/supplierService';
import productService from '../services/productService';
import saleService from '../services/saleService';
import recoveryService from '../services/recoveryService';
import reportService from '../services/reportService';
import ProcessSaleModal from './ProcessSaleModal';
import SalesReports from './SalesReports';
import RecoveryManagement from './RecoveryManagement';

const AdminDashboard = () => {
    const { user, logout, hasPermission } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'customers', 'suppliers', etc.
    
    // Statistics state
    const [statistics, setStatistics] = useState({
        customers: { totalCustomers: 0, newCustomersToday: 0 },
        suppliers: { totalSuppliers: 0, newSuppliersToday: 0 },
        products: { totalProducts: 0, outOfStockCount: 0, totalValue: 0 }
    });
    const [loadingStats, setLoadingStats] = useState(true);
    
    // Process Sale Modal
    const { isOpen: isProcessSaleOpen, onOpen: onProcessSaleOpen, onClose: onProcessSaleClose } = useDisclosure();
    
    // Report generation state
    const [generatingReport, setGeneratingReport] = useState(false);

    const bgColor = useColorModeValue('gray.50', 'gray.900');

    // Fetch all statistics
    const fetchStatistics = async () => {
        setLoadingStats(true);
        try {
            const [customerStats, supplierStats, productStats] = await Promise.all([
                customerService.getCustomerStatistics(),
                supplierService.getSupplierStatistics(),
                productService.getProductStatistics()
            ]);

            // Debug log to see the actual API responses
            console.log('Statistics API Responses:', {
                customerStats,
                supplierStats,
                productStats
            });

            setStatistics({
                customers: customerStats.success ? customerStats.data : { totalCustomers: 0, newCustomersToday: 0 },
                suppliers: supplierStats.success ? supplierStats.data : { totalSuppliers: 0, newSuppliersToday: 0 },
                products: productStats.success && productStats.data.overview ? productStats.data.overview : { totalProducts: 0, outOfStockCount: 0, totalValue: 0 }
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    // Generate comprehensive report
    const generateComprehensiveReport = async () => {
        setGeneratingReport(true);
        try {
            // Fetch all data needed for the report
            const [customersRes, suppliersRes, productsRes, salesRes, recoveriesRes, outstandingSalesRes] = await Promise.all([
                customerService.getAllCustomers(),
                supplierService.getAllSuppliers(),
                productService.getAllProducts(),
                saleService.getAllSales ? saleService.getAllSales() : Promise.resolve({ success: false, data: [] }),
                recoveryService.getAllRecoveries ? recoveryService.getAllRecoveries() : Promise.resolve({ success: false, data: [] }),
                recoveryService.getOutstandingSales ? recoveryService.getOutstandingSales() : Promise.resolve({ success: false, data: [] })
            ]);

            // Prepare data for report
            const reportData = {
                customers: customersRes.success ? customersRes.data : [],
                suppliers: suppliersRes.success ? suppliersRes.data : [],
                products: productsRes.success ? productsRes.data : [],
                sales: salesRes.success ? salesRes.data : [],
                recoveries: recoveriesRes.success ? recoveriesRes.data : [],
                outstandingSales: outstandingSalesRes.success ? outstandingSalesRes.data : []
            };

            // Generate and download the PDF
            await reportService.generateComprehensiveReport(reportData);
            const timestamp = new Date().toISOString().split('T')[0];
            reportService.savePDF(`shopmaster-report-${timestamp}.pdf`);

            // Show success message (you can add toast here)
            console.log('Report generated successfully');

        } catch (error) {
            console.error('Error generating report:', error);
            // Show error message (you can add toast here)
        } finally {
            setGeneratingReport(false);
        }
    };

    // Fetch statistics on component mount and when returning to dashboard
    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchStatistics();
        }
    }, [currentView]);

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const renderBreadcrumb = () => {
        const breadcrumbs = {
            'dashboard': [{ name: 'Dashboard', isCurrentPage: true }],
            'customers': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Customer Management', isCurrentPage: true }
            ],
            'suppliers': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Supplier Management', isCurrentPage: true }
            ],
            'inventory': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Inventory Management', isCurrentPage: true }
            ],
            'recovery': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Recovery Management', isCurrentPage: true }
            ],
            'sales-reports': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Sales & Reports', isCurrentPage: true }
            ],
        };

        const currentBreadcrumb = breadcrumbs[currentView] || breadcrumbs['dashboard'];

        return (
            <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
                {currentBreadcrumb.map((item, index) => (
                    <BreadcrumbItem key={index} isCurrentPage={item.isCurrentPage}>
                        {item.onClick ? (
                            <BreadcrumbLink onClick={item.onClick} cursor="pointer">
                                {item.name}
                            </BreadcrumbLink>
                        ) : (
                            <Text>{item.name}</Text>
                        )}
                    </BreadcrumbItem>
                ))}
            </Breadcrumb>
        );
    };

    return (
        <Box minH="100vh" bg={bgColor}>
            {/* Modern Header */}
            <Box bg="white" boxShadow="sm" borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl">
                    <Flex justify="space-between" align="center" py={4}>
                        <HStack spacing={4}>
                            {currentView !== 'dashboard' && (
                                <IconButton
                                    icon={<ArrowBackIcon />}
                                    variant="ghost"
                                    colorScheme="gray"
                                    aria-label="Back to Dashboard"
                                    onClick={() => setCurrentView('dashboard')}
                                />
                            )}
                            <Box>
                                <Heading size="lg" color="gray.800">
                                    ShopMaster
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                    {currentView === 'dashboard' ? 'Admin Dashboard' : 
                                     currentView === 'customers' ? 'Customer Management' : 
                                     currentView === 'suppliers' ? 'Supplier Management' : 
                                     currentView === 'inventory' ? 'Inventory Management' : 
                                     currentView === 'recovery' ? 'Recovery Management' : 
                                     currentView === 'sales-reports' ? 'Sales & Reports' : 'Admin Dashboard'}
                                </Text>
                            </Box>
                            <Badge colorScheme="red" px={3} py={1} borderRadius="full" textTransform="none">
                                Administrator
                            </Badge>
                        </HStack>
                        
                        <HStack spacing={3}>
                            <IconButton
                                icon={<BellIcon />}
                                variant="ghost"
                                colorScheme="gray"
                                aria-label="Notifications"
                            />
                            <Menu>
                                <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                                    <HStack spacing={2}>
                                        <Avatar size="sm" name={user.name} bg="brand.500" />
                                        <Text>{user.name}</Text>
                                    </HStack>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="7xl" py={8}>
                {/* Breadcrumb */}
                <Box mb={6}>
                    {renderBreadcrumb()}
                </Box>

                {/* Conditional Rendering */}
                {currentView === 'dashboard' && (
                    <>
                        {/* Statistics Overview */}
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                                <Stat>
                                    <StatLabel color="gray.600">Total Customers</StatLabel>
                                    {loadingStats ? (
                                        <Spinner size="md" color="brand.500" />
                                    ) : (
                                        <StatNumber color="brand.600" fontSize="2xl">
                                            {(statistics.customers?.totalCustomers || 0).toLocaleString()}
                                        </StatNumber>
                                    )}
                                    <StatHelpText color="brand.500">
                                        {loadingStats ? 'Loading...' : `+${statistics.customers?.newCustomersToday || 0} new today`}
                                    </StatHelpText>
                                </Stat>
                            </Box>
                            
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                                <Stat>
                                    <StatLabel color="gray.600">Total Products</StatLabel>
                                    {loadingStats ? (
                                        <Spinner size="md" color="accent.500" />
                                    ) : (
                                        <StatNumber color="accent.600" fontSize="2xl">
                                            {(statistics.products?.totalProducts || 0).toLocaleString()}
                                        </StatNumber>
                                    )}
                                    <StatHelpText color="accent.500">
                                        {loadingStats ? 'Loading...' : 'In inventory'}
                                    </StatHelpText>
                                </Stat>
                            </Box>
                            
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                                <Stat>
                                    <StatLabel color="gray.600">Total Suppliers</StatLabel>
                                    {loadingStats ? (
                                        <Spinner size="md" color="secondary.500" />
                                    ) : (
                                        <StatNumber color="secondary.600" fontSize="2xl">
                                            {(statistics.suppliers?.totalSuppliers || 0).toLocaleString()}
                                        </StatNumber>
                                    )}
                                    <StatHelpText color="secondary.500">
                                        {loadingStats ? 'Loading...' : `+${statistics.suppliers?.newSuppliersToday || 0} new today`}
                                    </StatHelpText>
                                </Stat>
                            </Box>
                            
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                                <Stat>
                                    <StatLabel color="gray.600">Out of Stock</StatLabel>
                                    {loadingStats ? (
                                        <Spinner size="md" color="red.500" />
                                    ) : (
                                        <StatNumber color="red.600" fontSize="2xl">
                                            {(statistics.products?.outOfStockCount || 0).toLocaleString()}
                                        </StatNumber>
                                    )}
                                    <StatHelpText color="red.500">
                                        {loadingStats ? 'Loading...' : 'Need attention'}
                                    </StatHelpText>
                                </Stat>
                            </Box>
                        </SimpleGrid>

                        {/* Report Generation Section */}
                        <Box bg="white" p={8} borderRadius="2xl" boxShadow="lg" border="1px" borderColor="gray.100" mb={8}>
                            <VStack spacing={6}>
                                <Box textAlign="center">
                                    <Heading size="lg" color="gray.800" mb={3}>
                                        Comprehensive Business Report
                                    </Heading>
                                    <Text color="gray.600" fontSize="md" maxW="md">
                                        Generate a detailed PDF report containing all business data including customers, suppliers, inventory, sales, and recoveries.
                                    </Text>
                                </Box>
                                
                                <HStack spacing={4} flexWrap="wrap" justify="center">
                                    <Badge colorScheme="blue" p={2} borderRadius="md">📊 Statistics</Badge>
                                    <Badge colorScheme="green" p={2} borderRadius="md">👥 Customers</Badge>
                                    <Badge colorScheme="orange" p={2} borderRadius="md">🏭 Suppliers</Badge>
                                    <Badge colorScheme="purple" p={2} borderRadius="md">📦 Inventory</Badge>
                                    <Badge colorScheme="teal" p={2} borderRadius="md">💰 Sales</Badge>
                                    <Badge colorScheme="red" p={2} borderRadius="md">💸 Recoveries</Badge>
                                </HStack>

                                <Button
                                    size="lg"
                                    colorScheme="brand"
                                    leftIcon={<FaChartBar />}
                                    onClick={generateComprehensiveReport}
                                    isLoading={generatingReport}
                                    loadingText="Generating Report..."
                                    borderRadius="xl"
                                    px={8}
                                    py={6}
                                    fontSize="md"
                                    fontWeight="semibold"
                                    boxShadow="lg"
                                    _hover={{
                                        transform: "translateY(-2px)",
                                        boxShadow: "xl"
                                    }}
                                    _active={{
                                        transform: "translateY(0)"
                                    }}
                                >
                                    Generate PDF Report
                                </Button>

                                <Text fontSize="sm" color="gray.500" textAlign="center">
                                    Report includes all current data and will be automatically downloaded as PDF
                                </Text>
                            </VStack>
                        </Box>
                    </>
                )}

                {currentView === 'customers' && (
                    <CustomerManagement />
                )}

                {currentView === 'suppliers' && (
                    <SupplierManagement />
                )}

                {currentView === 'inventory' && (
                    <InventoryManagement />
                )}

                {currentView === 'recovery' && (
                    <RecoveryManagement />
                )}

                {currentView === 'sales-reports' && (
                    <SalesReports />
                )}

                {currentView === 'dashboard' && (
                    <>
                        {/* Management Sections */}
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {/* Customer Management */}
                    <Box 
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        p={8} 
                        borderRadius="3xl" 
                        boxShadow="xl" 
                        border="2px solid"
                        borderColor="transparent"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        _hover={{ 
                            transform: "translateY(-8px) scale(1.02)",
                            boxShadow: "2xl",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        }}
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bg: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                            borderRadius: "3xl"
                        }}
                    >
                        <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
                            <HStack spacing={4}>
                                <Box 
                                    w="16" 
                                    h="16" 
                                    bg="rgba(255,255,255,0.2)" 
                                    borderRadius="2xl" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.3)"
                                >
                                    <Icon as={FaUsers} fontSize="3xl" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="lg" color="white" fontWeight="bold">
                                        Customer Management
                                    </Heading>
                                    <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                        Manage customer relationships
                                    </Text>
                                </Box>
                            </HStack>
                            {hasPermission('view_all') && (
                                <Button 
                                    bg="rgba(255,255,255,0.2)"
                                    color="white"
                                    border="1px solid rgba(255,255,255,0.3)"
                                    backdropFilter="blur(10px)"
                                    variant="solid" 
                                    size="lg"
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    _hover={{
                                        bg: "rgba(255,255,255,0.3)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg"
                                    }}
                                    onClick={() => handleViewChange('customers')}
                                >
                                    Manage Customers
                                </Button>
                            )}
                            <HStack spacing={2} pt={2}>
                                <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                <Text fontSize="sm" color="white" fontWeight="semibold">Add • Edit • Delete</Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Supplier Management */}
                    <Box 
                        bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        p={8} 
                        borderRadius="3xl" 
                        boxShadow="xl" 
                        border="2px solid"
                        borderColor="transparent"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        _hover={{ 
                            transform: "translateY(-8px) scale(1.02)",
                            boxShadow: "2xl",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        }}
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bg: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                            borderRadius: "3xl"
                        }}
                    >
                        <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
                            <HStack spacing={4}>
                                <Box 
                                    w="16" 
                                    h="16" 
                                    bg="rgba(255,255,255,0.2)" 
                                    borderRadius="2xl" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.3)"
                                >
                                    <FaIndustry size="48px" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="lg" color="white" fontWeight="bold">
                                        Supplier Management
                                    </Heading>
                                    <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                        Manage your suppliers
                                    </Text>
                                </Box>
                            </HStack>
                            {hasPermission('view_all') && (
                                <Button 
                                    bg="rgba(255,255,255,0.2)"
                                    color="white"
                                    border="1px solid rgba(255,255,255,0.3)"
                                    backdropFilter="blur(10px)"
                                    variant="solid" 
                                    size="lg"
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    _hover={{
                                        bg: "rgba(255,255,255,0.3)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg"
                                    }}
                                    onClick={() => handleViewChange('suppliers')}
                                >
                                    Manage Suppliers
                                </Button>
                            )}
                            <HStack spacing={2} pt={2}>
                                <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                <Text fontSize="sm" color="white" fontWeight="semibold">Add • Edit • Delete</Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Inventory Management */}
                    <Box 
                        bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        p={8} 
                        borderRadius="3xl" 
                        boxShadow="xl" 
                        border="2px solid"
                        borderColor="transparent"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        _hover={{ 
                            transform: "translateY(-8px) scale(1.02)",
                            boxShadow: "2xl",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        }}
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bg: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                            borderRadius: "3xl"
                        }}
                    >
                        <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
                            <HStack spacing={4}>
                                <Box 
                                    w="16" 
                                    h="16" 
                                    bg="rgba(255,255,255,0.2)" 
                                    borderRadius="2xl" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.3)"
                                >
                                    <Icon as={FaBoxes} fontSize="3xl" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="lg" color="white" fontWeight="bold">
                                        Inventory Management
                                    </Heading>
                                    <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                        Track your products
                                    </Text>
                                </Box>
                            </HStack>
                            {hasPermission('view_all') && (
                                <Button 
                                    bg="rgba(255,255,255,0.2)"
                                    color="white"
                                    border="1px solid rgba(255,255,255,0.3)"
                                    backdropFilter="blur(10px)"
                                    variant="solid" 
                                    size="lg"
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    _hover={{
                                        bg: "rgba(255,255,255,0.3)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg"
                                    }}
                                    onClick={() => handleViewChange('inventory')}
                                >
                                    Manage Inventory
                                </Button>
                            )}
                            <HStack spacing={2} pt={2}>
                                <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                <Text fontSize="sm" color="white" fontWeight="semibold">Add • Edit • Stock Management</Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Recovery Management */}
                    <Box
                        bgGradient="linear(135deg, purple.600 0%, pink.500 100%)"
                        borderRadius="3xl"
                        p={8}
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        transition="all 0.3s"
                        _hover={{
                            transform: "translateY(-4px)",
                            boxShadow: "2xl",
                            bgGradient: "linear(135deg, purple.700 0%, pink.600 100%)"
                        }}
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                            opacity: 0.1
                        }}
                    >
                        <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
                            <HStack spacing={4}>
                                <Box 
                                    w="16" 
                                    h="16" 
                                    bg="rgba(255,255,255,0.2)" 
                                    borderRadius="2xl" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.3)"
                                >
                                    <Icon as={FaDollarSign} fontSize="3xl" color="white" />
                                </Box>
                                <Box>
                                    <Heading size="lg" color="white" fontWeight="bold">
                                        Recovery Management
                                    </Heading>
                                    <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                        Track customer payments
                                    </Text>
                                </Box>
                            </HStack>
                            {hasPermission('view_all') && (
                                <Button 
                                    bg="rgba(255,255,255,0.2)"
                                    color="white"
                                    border="1px solid rgba(255,255,255,0.3)"
                                    backdropFilter="blur(10px)"
                                    variant="solid" 
                                    size="lg"
                                    borderRadius="xl"
                                    fontWeight="semibold"
                                    _hover={{
                                        bg: "rgba(255,255,255,0.3)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg"
                                    }}
                                    onClick={() => handleViewChange('recovery')}
                                >
                                    Manage Recoveries
                                </Button>
                            )}
                            <HStack spacing={2} pt={2}>
                                <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                <Text fontSize="sm" color="white" fontWeight="semibold">Outstanding • Overdue • Payments</Text>
                            </HStack>
                        </VStack>
                    </Box>

                        </SimpleGrid>

                        {/* Quick Actions Section */}
                        <Box mt={12}>
                            <Heading size="lg" mb={6} color="gray.800">
                                Quick Actions
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                                <Button 
                                    colorScheme="teal" 
                                    variant="solid" 
                                    size="lg"
                                    leftIcon={<Icon as={FaDollarSign} />}
                                    onClick={onProcessSaleOpen}
                                    borderRadius="xl"
                                    h="60px"
                                    fontWeight="semibold"
                                >
                                    Process Sale
                                </Button>
                                <Button 
                                    colorScheme="purple" 
                                    variant="solid" 
                                    size="lg"
                                    leftIcon={<Icon as={FaChartBar} />}
                                    onClick={() => handleViewChange('sales-reports')}
                                    borderRadius="xl"
                                    h="60px"
                                    fontWeight="semibold"
                                >
                                    Sales & Reports
                                </Button>
                                <Button 
                                    colorScheme="blue" 
                                    variant="outline" 
                                    size="lg"
                                    leftIcon={<Icon as={FaBoxes} />}
                                    borderRadius="xl"
                                    h="60px"
                                    fontWeight="semibold"
                                >
                                    Add Quick Product
                                </Button>
                                <Button 
                                    colorScheme="orange" 
                                    variant="outline" 
                                    size="lg"
                                    leftIcon={<Text>�</Text>}
                                    borderRadius="xl"
                                    h="60px"
                                    fontWeight="semibold"
                                >
                                    Today's Summary
                                </Button>
                            </SimpleGrid>
                        </Box>
                    </>
                )}
            </Container>
            
            {/* Process Sale Modal */}
            <ProcessSaleModal
                isOpen={isProcessSaleOpen}
                onClose={onProcessSaleClose}
                onSaleProcessed={(saleData) => {
                    console.log('Sale processed:', saleData);
                    // Refresh statistics after sale
                    if (currentView === 'dashboard') {
                        fetchStatistics();
                    }
                }}
            />
        </Box>
    );
};

export default AdminDashboard;