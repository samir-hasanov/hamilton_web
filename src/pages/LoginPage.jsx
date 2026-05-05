import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Container,
  Flex,
  Icon,
  // Link,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';
import {
  FaEye,
  FaEyeSlash,
  // FaGoogle, 
  // FaGithub,
  FaBuilding,
  FaTrash
} from 'react-icons/fa';
import authService from '../api_services/authService';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, clearExpiredTokens } from '../utils/tokenUtils';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExpiredTokens, setHasExpiredTokens] = useState(false);
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  //////////Clear cahce locale///////////

  useEffect(() => {
    // Login səhifəsi mount olduqda localStorage-i təmizlə
    localStorage.clear();
  }, []);


  ///////////////////////////////

  useEffect(() => {
    // Check for expired tokens on component mount
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && isTokenExpired(accessToken)) {
      setHasExpiredTokens(true);
      setShowTokenAlert(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearTokens = () => {
    clearExpiredTokens();
    setHasExpiredTokens(false);
    setShowTokenAlert(false);
    toast({
      title: 'Token-lər təmizləndi',
      description: 'Köhnə token-lər uğurla silindi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formData.username, formData.password);
      toast({
        title: 'Uğurla daxil oldunuz!',
        description: 'Hamilton sisteminə xoş gəlmisiniz.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // User rolu əsasında yönləndirmə
      const roles = response?.user?.roles || [];
      const isAdmin = roles.some(role => role.name === 'ADMIN');

      // Navigasiya
      if (isAdmin) {
        navigate('/dashboard');
      }
      else {
        navigate('/worker-dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Daxil olmaq mümkün olmadı';
      toast({
        title: 'Xəta!',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSocialLogin = (provider) => {
  //   toast({
  //     title: 'Məlumat',
  //     description: `${provider} ilə daxil olma funksiyası tezliklə əlavə olunacaq.`,
  //     status: 'info',
  //     duration: 3000,
  //     isClosable: true,
  //   });
  // };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      backgroundImage="linear-gradient(135deg,rgb(148, 192, 225) 0%,rgb(171, 220, 240) 100%)"
      py={ 10 }
    >
      <Container maxW="lg">
        { showTokenAlert && hasExpiredTokens && (
          <Alert status="warning" mb={ 4 } borderRadius="md">
            <AlertIcon />
            <AlertDescription flex={ 1 }>
              Köhnə token-lər tapıldı. Daxil olmaq üçün token-ləri təmizləyin.
            </AlertDescription>
            <HStack spacing={ 2 }>
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={ <Icon as={ FaTrash } /> }
                onClick={ handleClearTokens }
              >
                Təmizlə
              </Button>
              <CloseButton
                alignSelf="flex-start"
                position="relative"
                right={ -1 }
                top={ -1 }
                onClick={ () => setShowTokenAlert(false) }
              />
            </HStack>
          </Alert>
        ) }

        <Box
          opacity={ 0 }
          animation="fadeIn 0.5s ease-out forwards"
          sx={ {
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          } }
        >
          <Card
            bg="white"
            border="1px"
            borderColor="gray.200"
            shadow="xl"
            borderRadius="xl"
            overflow="hidden"
            _hover={ {
              transform: 'translateY(-2px)',
              boxShadow: '2xl'
            } }
            transition="all 0.3s ease"
          >
            <CardHeader textAlign="center" pb={ 0 }>
              <Flex justify="center" mb={ 4 }>
                <Icon as={ FaBuilding } w={ 8 } h={ 8 } color="blue.500" />
              </Flex>
              <Heading size="lg" color="gray.700">
                Hamilton Consulting
              </Heading>
              <Text color="gray.500" mt={ 2 }>
                Enter your details to log in to your account.
              </Text>
            </CardHeader>

            <CardBody pt={ 6 }>
              <form onSubmit={ handleSubmit }>
                <VStack spacing={ 6 }>
                  <Box width="full">
                    <Text color="gray.700" mb={ 2 } fontWeight="medium">
                      Username
                    </Text>
                    <Input
                      name="username"
                      value={ formData.username }
                      onChange={ handleInputChange }
                      placeholder="Enter username"
                      size="lg"
                      borderRadius="md"
                      borderColor="gray.200"
                      _focus={ {
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3182ce'
                      } }
                      required
                    />
                  </Box>

                  <Box width="full">
                    <Text color="gray.700" mb={ 2 } fontWeight="medium">
                      Password
                    </Text>
                    <HStack>
                      <Input
                        name="password"
                        type={ showPassword ? 'text' : 'password' }
                        value={ formData.password }
                        onChange={ handleInputChange }
                        placeholder="Enter password"
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.200"
                        _focus={ {
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px #3182ce'
                        } }
                        required
                      />
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={ () => setShowPassword(!showPassword) }
                        px={ 3 }
                      >
                        <Icon as={ showPassword ? FaEyeSlash : FaEye } color="gray.400" />
                      </Button>
                    </HStack>
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isLoading={ isLoading }
                    loadingText="Daxil olunur..."
                    borderRadius="md"
                    _hover={ {
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    } }
                    transition="all 0.2s"
                  >
                    Daxil Ol
                  </Button>
                </VStack>
              </form>

            </CardBody>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
