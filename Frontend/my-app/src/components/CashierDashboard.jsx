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
import { FaDollarSign, FaHandHoldingUsd, FaCashRegister } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ProcessSaleModal from './ProcessSaleModal';
import RecoveryManagement from './RecoveryManagement';

const CashierDashboard = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'recovery'
    
    // Process Sale Modal
    const { isOpen: isProcessSaleOpen, onOpen: onProcessSaleOpen, onClose: onProcessSaleClose } = useDisclosure();

    const bgColor = useColorModeValue('gray.50', 'gray.900');

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const renderBreadcrumb = () => {
        const breadcrumbs = {
            'dashboard': [{ name: 'Cashier Dashboard', isCurrentPage: true }],
            'recovery': [
                { name: 'Dashboard', onClick: () => setCurrentView('dashboard') },
                { name: 'Recovery Management', isCurrentPage: true }
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
                                    {currentView === 'dashboard' ? 'Cashier Dashboard' : 
                                     currentView === 'recovery' ? 'Recovery Management' : 'Cashier Dashboard'}
                                </Text>
                            </Box>
                            <Badge colorScheme="blue" px={3} py={1} borderRadius="full" textTransform="none">
                                Cashier
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
                                        <Avatar size="sm" name={user.name} bg="blue.500" />
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

            {/* Main Content */}
            <Container maxW="7xl" py={8}>
                {/* Breadcrumb */}
                {renderBreadcrumb()}
                
                <Divider my={6} />

                {/* Render Recovery Management */}
                {currentView === 'recovery' && (
                    <RecoveryManagement />
                )}

                {/* Dashboard Main Content */}
                {currentView === 'dashboard' && (
                    <>
                        {/* Welcome Section */}
                        <Box mb={8}>
                            <VStack spacing={4} textAlign="center">
                                <Heading size="xl" color="gray.800">
                                    Welcome, {user.name}!
                                </Heading>
                                <Text fontSize="lg" color="gray.600" maxW="md">
                                    Manage sales transactions and recovery operations efficiently
                                </Text>
                            </VStack>
                        </Box>

                        {/* Management Sections */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="4xl" mx="auto">
                            {/* Process Sale */}
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
                                            <Icon as={FaCashRegister} fontSize="3xl" color="white" />
                                        </Box>
                                        <Box>
                                            <Heading size="lg" color="white" fontWeight="bold">
                                                Process Sale
                                            </Heading>
                                            <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                                Create new sales transactions
                                            </Text>
                                        </Box>
                                    </HStack>
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
                                        onClick={onProcessSaleOpen}
                                    >
                                        Start New Sale
                                    </Button>
                                    <HStack spacing={2} pt={2}>
                                        <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                        <Text fontSize="sm" color="white" fontWeight="semibold">Scan • Calculate • Process</Text>
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* Recovery Management */}
                            <Box 
                                bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
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
                                            <Icon as={FaHandHoldingUsd} fontSize="3xl" color="white" />
                                        </Box>
                                        <Box>
                                            <Heading size="lg" color="white" fontWeight="bold">
                                                Recovery Management
                                            </Heading>
                                            <Text color="whiteAlpha.800" fontSize="md" mt={1}>
                                                Manage outstanding payments
                                            </Text>
                                        </Box>
                                    </HStack>
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
                                    <HStack spacing={2} pt={2}>
                                        <Text fontSize="sm" color="whiteAlpha.700">Quick actions:</Text>
                                        <Text fontSize="sm" color="white" fontWeight="semibold">Track • Collect • Update</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </SimpleGrid>
                    </>
                )}
            </Container>

            {/* Process Sale Modal */}
            <ProcessSaleModal
                isOpen={isProcessSaleOpen}
                onClose={onProcessSaleClose}
                onSaleProcessed={() => {
                    // Refresh any necessary data
                    console.log('Sale processed successfully');
                }}
            />
        </Box>
    );
};

export default CashierDashboard;