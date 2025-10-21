import React, { useState } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    VStack,
    HStack,
    Alert,
    AlertIcon,
    Text,
    Flex,
    Icon,
    Container,
    useColorModeValue,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import { MdStorefront } from 'react-icons/md';
import { BsCheckCircle } from 'react-icons/bs';
import { keyframes } from '@emotion/react';
import { USERS } from '../constants/users';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.username || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // Find user from hardcoded credentials
            const user = USERS.find(u => 
                u.username === formData.username && u.password === formData.password
            );

            if (user) {
                // Successful login
                onLogin({
                    username: user.username,
                    role: user.role,
                    name: user.name,
                    permissions: user.permissions
                });
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid minH="100vh" templateColumns={{ base: "1fr", lg: "1fr 1fr" }}>
            {/* Left Side - Brand Section */}
            <GridItem 
                bgGradient="linear(135deg, brand.600 0%, purple.600 100%)" 
                display={{ base: "none", lg: "flex" }}
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
            >
                {/* Subtle background pattern */}
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgImage="radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)"
                />
                
                <VStack spacing={8} textAlign="center" zIndex="1" px={12}>
                    <Box
                        w="120px"
                        h="120px"
                        bg="whiteAlpha.200"
                        borderRadius="3xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backdropFilter="blur(10px)"
                        border="1px solid rgba(255,255,255,0.2)"
                    >
                        <Icon as={MdStorefront} fontSize="4xl" color="white" />
                    </Box>
                    
                    <Box>
                        <Heading size="3xl" color="white" fontWeight="bold" mb={4}>
                            ShopMaster
                        </Heading>
                        <Text fontSize="xl" color="whiteAlpha.900" fontWeight="medium" mb={8} maxW="md">
                            Modern Point of Sale System for Your Business
                        </Text>
                    </Box>
                    
                    <VStack spacing={4} align="start" maxW="sm">
                        <HStack spacing={4}>
                            <Icon as={BsCheckCircle} color="white" boxSize={4} />
                            <Text color="whiteAlpha.900" fontSize="lg">Inventory Management</Text>
                        </HStack>
                        <HStack spacing={4}>
                            <Icon as={BsCheckCircle} color="white" boxSize={4} />
                            <Text color="whiteAlpha.900" fontSize="lg">Sales Analytics</Text>
                        </HStack>
                        <HStack spacing={4}>
                            <Icon as={BsCheckCircle} color="white" boxSize={4} />
                            <Text color="whiteAlpha.900" fontSize="lg">Customer Management</Text>
                        </HStack>
                    </VStack>
                </VStack>
            </GridItem>

            {/* Right Side - Login Form */}
            <GridItem 
                bg="gray.50" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                px={{ base: 4, md: 8, lg: 12 }}
                py={8}
            >
                <Box w="full" maxW="md">
                    <VStack spacing={8} align="stretch">
                        {/* Mobile Brand Header */}
                        <Box textAlign="center" display={{ base: "block", lg: "none" }} mb={4}>
                            <Heading size="2xl" color="gray.800" mb={2} fontWeight="bold">
                                ShopMaster
                            </Heading>
                            <Text color="gray.600" fontSize="md">
                                Point of Sale System
                            </Text>
                        </Box>

                        {/* Login Card */}
                        <Box
                            bg="white"
                            p={{ base: 6, md: 10 }}
                            borderRadius="2xl"
                            boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
                            border="1px solid"
                            borderColor="gray.200"
                        >
                            <VStack spacing={8} align="stretch">
                                {/* Desktop Header */}
                                <Box textAlign="center" display={{ base: "none", lg: "block" }}>
                                    <Heading size="xl" color="gray.800" mb={2} fontWeight="bold">
                                        Welcome Back
                                    </Heading>
                                    <Text color="gray.600" fontSize="md">
                                        Sign in to your account
                                    </Text>
                                </Box>

                                {/* Mobile Header */}
                                <Box textAlign="center" display={{ base: "block", lg: "none" }}>
                                    <Heading size="lg" color="gray.800" mb={1} fontWeight="bold">
                                        Sign In
                                    </Heading>
                                    <Text color="gray.600" fontSize="sm">
                                        Enter your credentials to continue
                                    </Text>
                                </Box>

                                {/* Form */}
                                <Box as="form" onSubmit={handleSubmit}>
                                    <VStack spacing={6}>
                                        <FormControl isRequired>
                                            <FormLabel color="gray.700" fontWeight="600" mb={3} fontSize="sm">
                                                Username
                                            </FormLabel>
                                            <Input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Enter your username"
                                                isDisabled={loading}
                                                size="lg"
                                                h="50px"
                                                bg="gray.50"
                                                borderColor="gray.300"
                                                focusBorderColor="brand.500"
                                                borderRadius="xl"
                                                fontSize="md"
                                                _hover={{ 
                                                    borderColor: 'brand.300',
                                                    bg: 'white'
                                                }}
                                                _focus={{
                                                    borderColor: 'brand.500',
                                                    bg: 'white',
                                                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel color="gray.700" fontWeight="600" mb={3} fontSize="sm">
                                                Password
                                            </FormLabel>
                                            <Input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                isDisabled={loading}
                                                size="lg"
                                                h="50px"
                                                bg="gray.50"
                                                borderColor="gray.300"
                                                focusBorderColor="brand.500"
                                                borderRadius="xl"
                                                fontSize="md"
                                                _hover={{ 
                                                    borderColor: 'brand.300',
                                                    bg: 'white'
                                                }}
                                                _focus={{
                                                    borderColor: 'brand.500',
                                                    bg: 'white',
                                                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
                                                }}
                                            />
                                        </FormControl>

                                        {error && (
                                            <Alert status="error" borderRadius="xl" variant="left-accent">
                                                <AlertIcon />
                                                <Text fontSize="sm">{error}</Text>
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            colorScheme="brand"
                                            size="lg"
                                            width="full"
                                            isLoading={loading}
                                            loadingText="Signing in..."
                                            fontSize="md"
                                            fontWeight="bold"
                                            h="50px"
                                            borderRadius="xl"
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 15px 35px rgba(66, 153, 225, 0.4)',
                                            }}
                                            _active={{
                                                transform: 'translateY(0px)',
                                            }}
                                            transition="all 0.2s"
                                            boxShadow="0 8px 20px rgba(66, 153, 225, 0.2)"
                                        >
                                            Sign In to Dashboard
                                        </Button>
                                    </VStack>
                                </Box>

                                {/* Footer text */}
                                <Text textAlign="center" fontSize="sm" color="gray.500" pt={4}>
                                    Secure access to your POS system
                                </Text>
                            </VStack>
                        </Box>

                        {/* Bottom text */}
                        <Text textAlign="center" fontSize="xs" color="gray.400">
                            © 2025 ShopMaster POS. All rights reserved.
                        </Text>
                    </VStack>
                </Box>
            </GridItem>
        </Grid>
    );
};

export default Login;