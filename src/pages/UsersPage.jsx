import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  IconButton,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaUserPlus, 
  FaCrown, 
  FaUser, 
  FaUserCog, 
  FaTrash, 
  FaEdit,
  FaUsers,
  FaMinus,
  FaKey
} from 'react-icons/fa';
import Layout from '../layout/Layout';
import authService from '../api_services/authService';

const UsersPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isRoleModalOpen, 
    onOpen: onRoleModalOpen, 
    onClose: onRoleModalClose 
  } = useDisclosure();
  const { 
    isOpen: isPasswordModalOpen, 
    onOpen: onPasswordModalOpen, 
    onClose: onPasswordModalClose 
  } = useDisclosure();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedRoleToRemove, setSelectedRoleToRemove] = useState('');
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        authService.getAllUsers(),
        authService.getAllRoles()
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
      
      // Calculate stats
      const adminUsers = usersData.filter(user => user.roles.includes('ADMIN')).length;
      setStats({
        totalUsers: usersData.length,
        adminUsers,
        regularUsers: usersData.length - adminUsers
      });
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Məlumatlar yüklənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber) {
        toast({
          title: 'Xəta',
          description: 'Bütün sahələri doldurun',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate phone number format
      if (!formData.phoneNumber.startsWith('+994')) {
        toast({
          title: 'Xəta',
          description: 'Telefon nömrəsi +994 ilə başlamalıdır',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await authService.register(formData);
      
      toast({
        title: 'Uğurlu',
        description: 'İşçi uğurla qeydiyyatdan keçdi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setFormData({
        username: '',
        email: '',
        password: '',
        phoneNumber: ''
      });
      onClose();
      
      // Reload data
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta',
        description: error.response?.data?.message || 'İşçi qeydiyyatı zamanı xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddRole = async (username, roleName) => {
    const roleDisplayName = roleName === 'ADMIN' ? 'Admin' : roleName === 'WORKER' ? 'Worker' : 'User';
    if (window.confirm(`${username} istifadəçisinə ${roleDisplayName} hüququ vermək istədiyinizə əminsiniz?`)) {
      try {
        await authService.addRoleToUser(username, roleName);
        toast({
          title: 'Uğurlu',
          description: `${roleDisplayName} hüququ ${username} istifadəçisinə əlavə edildi`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Xəta',
          description: 'Rol əlavə edilərkən xəta baş verdi',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleRemoveRole = async (username, roleName) => {
    const roleDisplayName = roleName === 'ADMIN' ? 'Admin' : roleName === 'WORKER' ? 'Worker' : 'User';
    
    // İstifadəçinin cari rollarını tap
    const currentUser = users.find(user => user.username === username);
    if (currentUser && currentUser.roles.length === 1) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçinin ən azı bir rolu olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (window.confirm(`${username} istifadəçisindən ${roleDisplayName} hüququnu silmək istədiyinizə əminsiniz?`)) {
      try {
        await authService.removeRoleFromUser(username, roleName);
        toast({
          title: 'Uğurlu',
          description: `${roleDisplayName} hüququ ${username} istifadəçisindən silindi`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Xəta',
          description: 'Rol silinərkən xəta baş verdi',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleRemoveRoleWithSelection = (username) => {
    const currentUser = users.find(user => user.username === username);
    if (!currentUser || currentUser.roles.length === 0) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçinin silinəcək rolu yoxdur',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (currentUser.roles.length === 1) {
      toast({
        title: 'Xəta',
        description: 'İstifadəçinin ən azı bir rolu olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedUserForRole(currentUser);
    setSelectedRoleToRemove(currentUser.roles[0]); // Default olaraq ilk rolu seç
    onRoleModalOpen();
  };

  const handleConfirmRoleRemoval = async () => {
    if (!selectedUserForRole || !selectedRoleToRemove) {
      toast({
        title: 'Xəta',
        description: 'Zəhmət olmasa rol seçin',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await handleRemoveRole(selectedUserForRole.username, selectedRoleToRemove);
    onRoleModalClose();
    setSelectedUserForRole(null);
    setSelectedRoleToRemove('');
  };

  const handleResetPassword = (username) => {
    const currentUser = users.find(user => user.username === username);
    setSelectedUserForPassword(currentUser);
    setNewPassword('');
    onPasswordModalOpen();
  };

  const handleConfirmPasswordReset = async () => {
    if (!selectedUserForPassword || !newPassword) {
      toast({
        title: 'Xəta',
        description: 'Zəhmət olmasa yeni şifrə daxil edin',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Xəta',
        description: 'Şifrə ən azı 6 simvol olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await authService.resetUserPassword(selectedUserForPassword.username, newPassword);
      toast({
        title: 'Uğurlu',
        description: `${selectedUserForPassword.username} istifadəçisinin şifrəsi uğurla yeniləndi`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPasswordModalClose();
      setSelectedUserForPassword(null);
      setNewPassword('');
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Şifrə yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`${username} istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      try {
        await authService.deleteUser(username);
        toast({
          title: 'Uğurlu',
          description: 'İstifadəçi uğurla silindi',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Xəta',
          description: 'İstifadəçi silinərkən xəta baş verdi',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getRoleBadge = (role) => {
    const colorScheme = role === 'ADMIN' ? 'red' : 'blue';
    return <Badge colorScheme={colorScheme}>{role}</Badge>;
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="lg" color="gray.700">
                İşçi İdarəetməsi
              </Heading>
              <Text color="gray.500">
                İşçilərin qeydiyyatı və hüquqlarının idarə edilməsi
              </Text>
            </VStack>
            <Button
              leftIcon={<FaUserPlus />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Yeni İşçi Əlavə Et
            </Button>
          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Ümumi İşçilər
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">{stats.totalUsers}</StatNumber>
                  <StatHelpText>
                    <FaUsers color="#3182CE" style={{ display: 'inline', marginRight: '8px' }} />
                    Bütün işçilər
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Admin İstifadəçilər
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="red.500">{stats.adminUsers}</StatNumber>
                  <StatHelpText>
                    <FaCrown color="#E53E3E" style={{ display: 'inline', marginRight: '8px' }} />
                    Admin hüquqları
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Adi İstifadəçilər
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">{stats.regularUsers}</StatNumber>
                  <StatHelpText>
                    <FaUser color="#38A169" style={{ display: 'inline', marginRight: '8px' }} />
                    Adi hüquqlar
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Users Table */}
          <Card bg="white" border="1px" borderColor="gray.200">
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>İstifadəçi Adı</Th>
                    <Th>Email</Th>
                    <Th>Telefon</Th>
                    <Th>Rollar</Th>
                    <Th>Əməliyyatlar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.username}>
                      <Td fontWeight="medium">{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.phoneNumber}</Td>
                      <Td>
                        <HStack spacing={2}>
                          {user.roles.map((role) => (
                            <Badge key={role} colorScheme={role === 'ADMIN' ? 'red' : role === 'WORKER' ? 'teal' : 'blue'}>
                              {role}
                            </Badge>
                          ))}
                        </HStack>
                      </Td>
                                             <Td>
                         <HStack spacing={2}>
                           {/* Add Admin Role Button */}
                           {!user.roles.includes('ADMIN') && (
                             <IconButton
                               size="sm"
                               colorScheme="red"
                               icon={<FaCrown />}
                               onClick={() => handleAddRole(user.username, 'ADMIN')}
                               title="Admin hüququ ver"
                             />
                           )}
                           
                           {/* Add User Role Button */}
                           {!user.roles.includes('USER') && (
                             <IconButton
                               size="sm"
                               colorScheme="blue"
                               icon={<FaUser />}
                               onClick={() => handleAddRole(user.username, 'USER')}
                               title="User hüququ ver"
                             />
                           )}

                          {/* Add Worker Role Button */}
                          {!user.roles.includes('WORKER') && (
                            <IconButton
                              size="sm"
                              colorScheme="teal"
                              icon={<FaUserCog />}
                              onClick={() => handleAddRole(user.username, 'WORKER')}
                              title="Worker hüququ ver"
                            />
                          )}
                           
                                                       {/* Remove Role Button (Dropdown Selection) */}
                            {user.roles.length > 1 && (
                              <IconButton
                                size="sm"
                                colorScheme="orange"
                                icon={<FaMinus />}
                                onClick={() => handleRemoveRoleWithSelection(user.username)}
                                title="Hüquq sil"
                              />
                            )}
                            
                            {/* Reset Password Button */}
                            <IconButton
                              size="sm"
                              colorScheme="purple"
                              icon={<FaKey />}
                              onClick={() => handleResetPassword(user.username)}
                              title="Şifrəni yenilə"
                            />
                            
                            {/* Delete User Button */}
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<FaTrash />}
                              onClick={() => handleDeleteUser(user.username)}
                              title="İstifadəçini sil"
                            />
                         </HStack>
                       </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </VStack>

                 {/* Add User Modal */}
         <Modal isOpen={isOpen} onClose={onClose} size="md">
           <ModalOverlay />
           <ModalContent>
             <ModalHeader>Yeni İşçi Əlavə Et</ModalHeader>
             <ModalCloseButton />
             <ModalBody>
               <VStack spacing={4}>
                 <FormControl isRequired>
                   <FormLabel>İstifadəçi Adı</FormLabel>
                   <Input
                     name="username"
                     value={formData.username}
                     onChange={handleInputChange}
                     placeholder="İstifadəçi adını daxil edin"
                   />
                 </FormControl>

                 <FormControl isRequired>
                   <FormLabel>Email</FormLabel>
                   <Input
                     name="email"
                     type="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="Email ünvanını daxil edin"
                   />
                 </FormControl>

                 <FormControl isRequired>
                   <FormLabel>Şifrə</FormLabel>
                   <Input
                     name="password"
                     type="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     placeholder="Şifrəni daxil edin"
                   />
                 </FormControl>

                 <FormControl isRequired>
                   <FormLabel>Telefon Nömrəsi</FormLabel>
                   <Input
                     name="phoneNumber"
                     value={formData.phoneNumber}
                     onChange={handleInputChange}
                     placeholder="+994501234567"
                   />
                 </FormControl>
               </VStack>
             </ModalBody>

             <ModalFooter>
               <Button variant="ghost" mr={3} onClick={onClose}>
                 Ləğv Et
               </Button>
               <Button colorScheme="blue" onClick={handleSubmit}>
                 Əlavə Et
               </Button>
             </ModalFooter>
           </ModalContent>
         </Modal>

                   {/* Role Removal Modal */}
          <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Hüquq Sil</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <Text>
                    <strong>{selectedUserForRole?.username}</strong> istifadəçisindən hansı hüququ silmək istəyirsiniz?
                  </Text>
                  
                  <FormControl>
                    <FormLabel>Hüquq Seçin</FormLabel>
                    <Select
                      value={selectedRoleToRemove}
                      onChange={(e) => setSelectedRoleToRemove(e.target.value)}
                    >
                      {selectedUserForRole?.roles.map((role) => (
                        <option key={role} value={role}>
                          {role === 'ADMIN' ? 'Admin' : role === 'WORKER' ? 'Worker' : 'User'}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onRoleModalClose}>
                  Ləğv Et
                </Button>
                <Button colorScheme="red" onClick={handleConfirmRoleRemoval}>
                  Sil
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Password Reset Modal */}
          <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Şifrə Yenilə</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <Text>
                    <strong>{selectedUserForPassword?.username}</strong> istifadəçisi üçün yeni şifrə təyin edin
                  </Text>
                  
                  <FormControl isRequired>
                    <FormLabel>Yeni Şifrə</FormLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifrəni daxil edin"
                    />
                  </FormControl>
                  
                  <Text fontSize="sm" color="gray.500">
                    Şifrə ən azı 6 simvol olmalıdır
                  </Text>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onPasswordModalClose}>
                  Ləğv Et
                </Button>
                <Button colorScheme="purple" onClick={handleConfirmPasswordReset}>
                  Yenilə
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
      </Container>
    </Layout>
  );
};

export default UsersPage;
