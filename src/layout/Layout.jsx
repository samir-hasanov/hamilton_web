import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Container,
  Text,
  HStack,
  Icon,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaBuilding, FaGithub, FaLinkedin, FaTwitter, FaUsers, FaUserCircle } from 'react-icons/fa';
import authService from '../api_services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sessionUser, setSessionUser] = useState(() => authService.getCurrentUser());

  const refreshSessionFromStorage = useCallback(() => {
    if (!authService.isAuthenticated()) {
      setSessionUser(null);
      return;
    }
    setSessionUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setSessionUser(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await authService.getMe();
        if (cancelled) return;
        setSessionUser(authService.getCurrentUser());
      } catch {
        if (!cancelled) setSessionUser(authService.getCurrentUser());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    const onUserUpdated = () => refreshSessionFromStorage();
    window.addEventListener('hamilton-auth-user', onUserUpdated);
    return () => window.removeEventListener('hamilton-auth-user', onUserUpdated);
  }, [refreshSessionFromStorage]);

  const user = sessionUser;
  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  return (
    <Box minH="100vh" bg="gray.50">
      <Box
        as="header"
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        py={4}
        shadow="sm"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Icon as={FaBuilding} w={6} h={6} color="blue.500" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Hamilton
              </Text>
            </HStack>

            <HStack spacing={6} flexWrap="wrap" justify="center">
              {isAdmin ? (
                <>
                  <Link as={RouterLink} to="/dashboard" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Dashboard
                  </Link>
                  <Link as={RouterLink} to="/companies" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Şirkətlər
                  </Link>
                  <Link as={RouterLink} to="/companies/distribute" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Bölüşdürmə
                  </Link>
                  <Link as={RouterLink} to="/my-tasks" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Tapşırıqlar
                  </Link>
                  <Link as={RouterLink} to="/task-categories" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Kateqoriyalar
                  </Link>
                  <Link as={RouterLink} to="/users" color="gray.600" _hover={{ color: 'blue.500' }}>
                    <HStack spacing={1}>
                      <Icon as={FaUsers} />
                      <Text>İşçilər</Text>
                    </HStack>
                  </Link>
                  <Link as={RouterLink} to="/profile" color="gray.600" _hover={{ color: 'blue.500' }}>
                    <HStack spacing={1}>
                      <Icon as={FaUserCircle} />
                      <Text>Profil</Text>
                    </HStack>
                  </Link>
                </>
              ) : (
                <>
                  <Link as={RouterLink} to="/worker-dashboard" color="gray.600" _hover={{ color: 'blue.500' }}>
                    İş Masası
                  </Link>
                  <Link as={RouterLink} to="/profile" color="gray.600" _hover={{ color: 'blue.500' }}>
                    <HStack spacing={1}>
                      <Icon as={FaUserCircle} />
                      <Text>Profil</Text>
                    </HStack>
                  </Link>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box as="main" flex="1">
        {children}
      </Box>

      <Box as="footer" bg="white" borderTop="1px" borderColor="gray.200" py={8} mt="auto">
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
            <HStack spacing={3} mb={{ base: 4, md: 0 }}>
              <Icon as={FaBuilding} w={5} h={5} color="blue.500" />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Hamilton
              </Text>
            </HStack>

            <HStack spacing={6}>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <Icon as={FaGithub} w={5} h={5} />
              </Link>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <Icon as={FaLinkedin} w={5} h={5} />
              </Link>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <Icon as={FaTwitter} w={5} h={5} />
              </Link>
            </HStack>
          </Flex>

          <Text textAlign="center" color="gray.500" mt={4} fontSize="sm">
            © 2024 Hamilton. Bütün hüquqlar qorunur.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
