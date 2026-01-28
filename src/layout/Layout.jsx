import React from 'react';
import {
  Box,
  Flex,
  Container,
  Text,
  HStack,
  Icon,
  Link
} from '@chakra-ui/react';
import { FaBuilding, FaGithub, FaLinkedin, FaTwitter, FaUsers } from 'react-icons/fa';
import authService from '../api_services/authService';

const Layout = ({ children }) => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        as="header"
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        py={4}
        shadow="sm"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaBuilding} w={6} h={6} color="blue.500" />
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Hamilton
              </Text>
            </HStack>
            
            <HStack spacing={6}>
              {isAdmin ? (
                <>
                  <Link href="/dashboard" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Dashboard
                  </Link>
                  <Link href="/companies" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Şirkətlər
                  </Link>
                  <Link href="/companies/distribute" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Bölüşdürmə
                  </Link>
                  <Link href="/tasks" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Tapşırıqlar
                  </Link>
                  <Link href="/task-categories" color="gray.600" _hover={{ color: 'blue.500' }}>
                    Kateqoriyalar
                  </Link>
                  <Link href="/users" color="gray.600" _hover={{ color: 'blue.500' }}>
                    <HStack spacing={1}>
                      <Icon as={FaUsers} />
                      <Text>İşçilər</Text>
                    </HStack>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/worker-dashboard" color="gray.600" _hover={{ color: 'blue.500' }}>
                    İş Masası
                  </Link>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" flex="1">
        {children}
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        bg="white"
        borderTop="1px"
        borderColor="gray.200"
        py={8}
        mt="auto"
      >
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
