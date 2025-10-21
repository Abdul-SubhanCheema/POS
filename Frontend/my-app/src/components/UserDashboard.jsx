import React from 'react';
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
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Progress,
    CircularProgress,
    CircularProgressLabel
} from '@chakra-ui/react';
import { ChevronDownIcon, BellIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaUsers, FaBoxes, FaDollarSign, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, logout } = useAuth();

    const bgColor = useColorModeValue('gray.50', 'gray.900');

    return (
        <Box minH="100vh" bg={bgColor}>
            {/* Modern Header */}
            <Box bg="white" boxShadow="sm" borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl">
                    <Flex justify="space-between" align="center" py={4}>
                        <HStack spacing={4}>
                            <Box>
                                <Heading size="lg" color="gray.800">
                                    ShopMaster
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                    Cashier Terminal
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
                                        <Avatar size="sm" name={user.name} bg="secondary.500" />
                                        <Text>{user.name}</Text>
                                    </HStack>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem icon={<SettingsIcon />}>My Profile</MenuItem>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="7xl" py={8}>
                {/* Today's Performance */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                    <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                        <HStack justify="space-between">
                            <Box>
                                <Text color="gray.600" fontSize="sm" fontWeight="medium">My Sales Today</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="secondary.600">$1,247</Text>
                                <Text fontSize="sm" color="secondary.500">12 transactions</Text>
                            </Box>
                            <CircularProgress value={75} color="secondary.500" size="60px">
                                <CircularProgressLabel fontSize="sm" fontWeight="bold">75%</CircularProgressLabel>
                            </CircularProgress>
                        </HStack>
                    </Box>
                    
                    <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                        <HStack justify="space-between">
                            <Box>
                                <Text color="gray.600" fontSize="sm" fontWeight="medium">Customers Served</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="brand.600">18</Text>
                                <Text fontSize="sm" color="brand.500">+3 new customers</Text>
                            </Box>
                            <Box w="60px" h="60px" bg="brand.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                <FaUsers fontSize="24px" color="var(--chakra-colors-brand-600)" />
                            </Box>
                        </HStack>
                    </Box>
                    
                    <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="1px" borderColor="gray.100">
                        <HStack justify="space-between">
                            <Box>
                                <Text color="gray.600" fontSize="sm" fontWeight="medium">Avg. Transaction</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="accent.600">$104</Text>
                                <Text fontSize="sm" color="accent.500">Above target</Text>
                            </Box>
                            <Box w="60px" h="60px" bg="accent.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                <FaDollarSign size="32px" color="var(--chakra-colors-accent-600)" />
                            </Box>
                        </HStack>
                    </Box>
                </SimpleGrid>

                {/* Quick Actions */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={10}>
                    {/* Primary Sales Section */}
                    <Box 
                        bg="gradient-to-br"
                        bgGradient="linear(to-br, secondary.500, secondary.600)"
                        p={10} 
                        borderRadius="3xl" 
                        boxShadow="2xl" 
                        color="white"
                        position="relative"
                        overflow="hidden"
                    >
                        <Box position="absolute" top="-20px" right="-20px" opacity="0.1">
                            <FaDollarSign fontSize="120px" color="var(--chakra-colors-green-500)" />
                        </Box>
                        <VStack spacing={6} align="stretch" position="relative">
                            <Box>
                                <Heading size="xl" mb={2}>
                                    Process Sale
                                </Heading>
                                <Text fontSize="lg" opacity="0.9">
                                    Start a new transaction with customers
                                </Text>
                            </Box>
                            <Button 
                                size="xl" 
                                bg="white" 
                                color="secondary.600" 
                                fontWeight="bold"
                                fontSize="lg"
                                py={8}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                                }}
                                transition="all 0.2s"
                            >
                                START NEW SALE
                            </Button>
                            <HStack spacing={4}>
                                <Button variant="outline" colorScheme="whiteAlpha" flex="1">
                                    View Today's Sales
                                </Button>
                                <Button variant="ghost" colorScheme="whiteAlpha" flex="1">
                                    Sales History
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Customer & Inventory Management */}
                    <VStack spacing={6}>
                        {/* Customer Management */}
                        <Box 
                            bg="white" 
                            p={8} 
                            borderRadius="2xl" 
                            boxShadow="lg" 
                            border="1px" 
                            borderColor="gray.100"
                            w="full"
                            _hover={{ 
                                boxShadow: "xl",
                                transform: "translateY(-2px)",
                                transition: "all 0.3s"
                            }}
                        >
                            <VStack spacing={6} align="stretch">
                                <HStack spacing={3}>
                                    <Box w="12" h="12" bg="brand.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                                        <FaUsers fontSize="24px" color="var(--chakra-colors-brand-600)" />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="gray.800">
                                            Customer Management
                                        </Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            Add and search customers
                                        </Text>
                                    </Box>
                                </HStack>
                                <HStack spacing={3}>
                                    <Button colorScheme="brand" variant="solid" flex="1">
                                        Add Customer
                                    </Button>
                                    <Button colorScheme="brand" variant="outline" flex="1">
                                        Search
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* Inventory Check */}
                        <Box 
                            bg="white" 
                            p={8} 
                            borderRadius="2xl" 
                            boxShadow="lg" 
                            border="1px" 
                            borderColor="gray.100"
                            w="full"
                            _hover={{ 
                                boxShadow: "xl",
                                transform: "translateY(-2px)",
                                transition: "all 0.3s"
                            }}
                        >
                            <VStack spacing={6} align="stretch">
                                <HStack spacing={3}>
                                    <Box w="12" h="12" bg="accent.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                                        <FaBoxes fontSize="24px" color="var(--chakra-colors-accent-600)" />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="gray.800">
                                            Inventory Check
                                        </Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            Search products and stock
                                        </Text>
                                    </Box>
                                </HStack>
                                <HStack spacing={3}>
                                    <Button colorScheme="accent" variant="solid" flex="1">
                                        Search Products
                                    </Button>
                                    <Button colorScheme="accent" variant="outline" flex="1">
                                        Check Stock
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </VStack>
                </SimpleGrid>

                {/* My Performance Section */}
                <Box mt={10}>
                    <Heading size="lg" mb={6} color="gray.800">
                        My Performance
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box bg="white" p={8} borderRadius="2xl" boxShadow="lg" border="1px" borderColor="gray.100">
                            <VStack spacing={6} align="stretch">
                                <HStack spacing={3}>
                                    <Box w="12" h="12" bg="purple.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                                        <FaChartBar fontSize="24px" color="var(--chakra-colors-purple-600)" />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="gray.800">
                                            My Activity
                                        </Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            Track your performance
                                        </Text>
                                    </Box>
                                </HStack>
                                <Button colorScheme="purple" variant="solid" size="lg">
                                    View My Sales Today
                                </Button>
                                <Button colorScheme="purple" variant="outline">
                                    Transaction History
                                </Button>
                            </VStack>
                        </Box>

                        <Box bg="white" p={8} borderRadius="2xl" boxShadow="lg" border="1px" borderColor="gray.100">
                            <VStack spacing={4} align="stretch">
                                <Heading size="md" color="gray.800" mb={2}>
                                    Today's Progress
                                </Heading>
                                
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Sales Target</Text>
                                        <Text fontSize="sm" fontWeight="semibold">75%</Text>
                                    </HStack>
                                    <Progress value={75} colorScheme="secondary" size="md" borderRadius="full" />
                                </Box>
                                
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Customer Goals</Text>
                                        <Text fontSize="sm" fontWeight="semibold">90%</Text>
                                    </HStack>
                                    <Progress value={90} colorScheme="brand" size="md" borderRadius="full" />
                                </Box>
                                
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Transaction Quality</Text>
                                        <Text fontSize="sm" fontWeight="semibold">85%</Text>
                                    </HStack>
                                    <Progress value={85} colorScheme="accent" size="md" borderRadius="full" />
                                </Box>
                            </VStack>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Container>
        </Box>
    );
};

export default UserDashboard;