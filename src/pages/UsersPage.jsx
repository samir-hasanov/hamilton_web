import React, { useState, useEffect } from 'react';
import {
  Box,
  Thead,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Table,
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
  StatHelpText,
  Checkbox,
  TableContainer,
  Wrap,
  WrapItem,
  Tooltip
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
  FaKey,
  FaRegEdit,
  FaCriticalRole
} from 'react-icons/fa';
import Layout from '../layout/Layout';
import authService from '../api_services/authService';
import { Flex } from '@chakra-ui/react';


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
    workerUsers: 0,
    regularUsers: 0
  });
  const toast = useToast();

  const {
    isOpen: isCreateRoleOpen,
    onOpen: onCreateRoleOpen,
    onClose: onCreateRoleClose
  } = useDisclosure();

  const {
    isOpen: isEditUserOpen,
    onOpen: onEditUserOpen,
    onClose: onEditUserClose
  } = useDisclosure();

  const {
    isOpen: isEditRoleOpen,
    onOpen: onEditRoleOpen,
    onClose: onEditRoleClose
  } = useDisclosure();

  const {
    isOpen: isAddRoleModalOpen,
    onOpen: onAddRoleModalOpen,
    onClose: onAddRoleModalClose
  } = useDisclosure();

  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [addRoleForUser, setAddRoleForUser] = useState(null);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');

  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ displayName: '', email: '', phoneNumber: '', password: '' });

  const [editRoleName, setEditRoleName] = useState('');
  const [editRolePermissions, setEditRolePermissions] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  useEffect(() => {
    loadData();
    loadPermissions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        authService.getAllUsers(),
        authService.getAllRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);

      const adminUsers = usersData.filter(
        u => u.roles && u.roles.some(r => r.name === 'ADMIN')
      ).length;
      const workerUsers = usersData.filter(
        u => u.roles && u.roles.some(r => r.name === 'WORKER')
      ).length;
      const regularUsers = usersData.filter(
        u => u.roles && u.roles.length && u.roles.every(r => r.name !== 'ADMIN' && r.name !== 'WORKER')
      ).length;
      setStats({
        totalUsers: usersData.length,
        adminUsers,
        workerUsers,
        regularUsers: regularUsers || usersData.length - adminUsers - workerUsers
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
  /////////////////////Load permission///////////
  const loadPermissions = async () => {
    try {
      const data = await authService.getAllPermissions();
      setPermissions(data);
    } catch {
      toast({
        title: 'Xəta',
        description: 'Permission-lar yüklənmədi',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  //////////////////////////////////////////////
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
    const roleDisplayName = roleName === 'ADMIN' ? 'Admin' : roleName === 'WORKER' ? 'Worker' : roleName === 'USER' ? 'User' : roleName;
    if (window.confirm(`${username} istifadəçisinə "${roleDisplayName}" rolunu vermək istədiyinizə əminsiniz?`)) {
      try {
        await authService.addRoleToUser(username, roleName);
        toast({
          title: 'Uğurlu',
          description: `"${roleDisplayName}" rolu ${username} istifadəçisinə əlavə edildi`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Xəta',
          description: error.response?.data?.message || 'Rol əlavə edilərkən xəta baş verdi',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleOpenAddRoleModal = (user) => {
    setAddRoleForUser(user);
    const availableRoles = roles.filter(r => !user.roles?.some(ur => ur.name === r.name));
    setSelectedRoleToAdd(availableRoles.length ? availableRoles[0].name : '');
    onAddRoleModalOpen();
  };

  const handleConfirmAddRole = async () => {
    if (!addRoleForUser || !selectedRoleToAdd) return;
    try {
      await authService.addRoleToUser(addRoleForUser.username, selectedRoleToAdd);
      toast({
        title: 'Uğurlu',
        description: `"${selectedRoleToAdd}" rolu ${addRoleForUser.username} istifadəçisinə əlavə edildi`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAddRoleModalClose();
      setAddRoleForUser(null);
      setSelectedRoleToAdd('');
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta',
        description: error.response?.data?.message || 'Rol əlavə edilərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const availableRolesForAdd = addRoleForUser
    ? roles.filter(r => !addRoleForUser.roles?.some(ur => ur.name === r.name))
    : [];

  ////////////////Role Cheker ////////////
  const togglePermission = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  ///////////////////////////////////////

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
    setSelectedRoleToRemove(currentUser.roles[0].name);
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
    const roleName = typeof selectedRoleToRemove === 'string' ? selectedRoleToRemove : selectedRoleToRemove?.name;
    await handleRemoveRole(selectedUserForRole.username, roleName);
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


  ////////////////////////create PERMISSION to role submit //////////////////
  const handleCreatePermissionsToRole = async () => {
    if (!roleName || selectedPermissions.length === 0) {
      toast({
        title: 'Xəta',
        description: 'Role adı və permission seçilməlidir',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      await authService.createPermissionsToRole({
        name: roleName.toUpperCase(),
        permissions: selectedPermissions
      });

      toast({
        title: 'Uğurlu',
        description: 'Yeni permission to role yaradıldı',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      setRoleName('');
      setSelectedPermissions([]);
      onCreateRoleClose();
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta',
        description:
          error.response?.data?.message || 'Server xətası',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  //////////////////////////////////////////////////////////////

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

  const handleOpenEditUser = (user) => {
    setEditUser(user);
    setEditUserForm({
      displayName: user.displayName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: ''
    });
    onEditUserOpen();
  };

  const handleSaveEditUser = async () => {
    if (!editUser) return;
    const payload = {
      displayName: editUserForm.displayName?.trim() === '' ? null : (editUserForm.displayName || null),
      email: editUserForm.email || null,
      phoneNumber: editUserForm.phoneNumber || null
    };
    if (editUserForm.password && editUserForm.password.trim() !== '') {
      payload.password = editUserForm.password;
    }
    try {
      await authService.updateUser(editUser.username, payload);
      toast({
        title: 'Uğurlu',
        description: 'İstifadəçi məlumatları yeniləndi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditUserClose();
      setEditUser(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta',
        description: error.response?.data?.message || 'İstifadəçi yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenEditRole = (role) => {
    setEditRoleName(role.name);
    setEditRolePermissions(role.permissions ? [...role.permissions] : []);
    onEditRoleOpen();
  };

  const toggleEditRolePermission = (permission) => {
    setEditRolePermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSaveEditRole = async () => {
    if (!editRoleName || editRolePermissions.length === 0) {
      toast({
        title: 'Xəta',
        description: 'Ən azı bir permission seçilməlidir',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await authService.updateRolePermissions(editRoleName, editRolePermissions);
      toast({
        title: 'Uğurlu',
        description: 'Rol permission-ları yeniləndi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditRoleClose();
      loadData();
      loadPermissions();
    } catch (error) {
      toast({
        title: 'Xəta',
        description: error.response?.data?.message || 'Rol yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getRoleBadge = (role) => {
    const colorScheme = role === 'ADMIN' ? 'red' : role === 'WORKER' ? 'teal' : 'blue';
    return <Badge colorScheme={colorScheme}>{role}</Badge>;
  };

  const PermissionBadges = ({ permissions, maxShow = 4 }) => {
    const list = permissions || [];
    const show = list.slice(0, maxShow);
    const rest = list.length - maxShow;
    return (
      <Wrap spacing={1} maxW="100%">
        {show.map(p => (
          <WrapItem key={p}>
            <Badge variant="subtle" colorScheme="purple" fontSize="xs">{p}</Badge>
          </WrapItem>
        ))}
        {rest > 0 && (
          <WrapItem>
            <Tooltip label={list.slice(maxShow).join(', ')}>
              <Badge variant="outline" colorScheme="gray" fontSize="xs">+{rest}</Badge>
            </Tooltip>
          </WrapItem>
        )}
      </Wrap>
    );
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={ 8 }>
        <VStack spacing={ 8 } align="stretch">
          {/* Header */ }
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={ 2 }>
              <Heading size="lg" color="gray.700">
                İşçi İdarəetməsi
              </Heading>
              <Text color="gray.500">
                İşçilərin qeydiyyatı və hüquqlarının idarə edilməsi
              </Text>
            </VStack>
            <Flex justify="space-between" gap="20px">
              <Button
                leftIcon={ <FaUserPlus /> }
                colorScheme="blue"
                onClick={ onOpen }
              >
                Yeni İşçi Əlavə Et
              </Button>
              <Button
                leftIcon={ <FaCriticalRole /> }
                colorScheme="blue"
                onClick={ onCreateRoleOpen }
              >
                Yeni Role Əlavə Et
              </Button>
            </Flex>
          </HStack>

          {/* Stats Cards */ }
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            <Card bg="white" border="1px" borderColor="gray.200" shadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Ümumi İşçilər</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">{stats.totalUsers}</StatNumber>
                  <StatHelpText>
                    <FaUsers color="#3182CE" style={{ display: 'inline', marginRight: '8px' }} />
                    Bütün işçilər
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px" borderColor="gray.200" shadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Admin İstifadəçilər</StatLabel>
                  <StatNumber fontSize="2xl" color="red.500">{stats.adminUsers}</StatNumber>
                  <StatHelpText>
                    <FaCrown color="#E53E3E" style={{ display: 'inline', marginRight: '8px' }} />
                    Admin hüquqları
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px" borderColor="gray.200" shadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">İşçi (WORKER)</StatLabel>
                  <StatNumber fontSize="2xl" color="teal.500">{stats.workerUsers}</StatNumber>
                  <StatHelpText>
                    <FaUserCog color="#319795" style={{ display: 'inline', marginRight: '8px' }} />
                    WORKER hüquqları
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px" borderColor="gray.200" shadow="sm">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Adi İstifadəçilər</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">{stats.regularUsers}</StatNumber>
                  <StatHelpText>
                    <FaUser color="#38A169" style={{ display: 'inline', marginRight: '8px' }} />
                    Adi hüquqlar
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Users Table - responsive */ }
          <Card bg="white" border="1px" borderColor="gray.200" shadow="sm" overflow="hidden">
            <CardBody p={{ base: 2, md: 4 }}>
              <TableContainer overflowX="auto" whiteSpace="normal">
                <Table variant="simple" size="sm" layout={{ base: 'fixed', lg: 'auto' }}>
                  <Thead>
                    <Tr>
                      <Th w={{ base: '80px', md: 'auto' }}>İstifadəçi Adı</Th>
                      <Th display={{ base: 'none', md: 'table-cell' }}>Email</Th>
                      <Th display={{ base: 'none', lg: 'table-cell' }}>Telefon</Th>
                      <Th>Rollar</Th>
                      <Th maxW={{ base: '100px', md: '180px' }}>Permission-lar</Th>
                      <Th w={{ base: '120px', md: 'auto' }}>Əməliyyatlar</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.username}>
                        <Td fontWeight="medium" fontSize="sm">
                          {user.username}
                          {user.displayName ? (
                            <Text as="span" display="block" fontSize="xs" color="gray.500" fontWeight="normal">
                              {user.displayName}
                            </Text>
                          ) : null}
                        </Td>
                        <Td display={{ base: 'none', md: 'table-cell' }} fontSize="sm">{user.email}</Td>
                        <Td display={{ base: 'none', lg: 'table-cell' }} fontSize="sm">{user.phoneNumber || '—'}</Td>
                        <Td>
                          <Wrap spacing={1}>
                            {user.roles?.map((role) => (
                              <WrapItem key={role.name}>
                                <Badge
                                  colorScheme={role.name === 'ADMIN' ? 'red' : role.name === 'WORKER' ? 'teal' : 'blue'}
                                  fontSize="xs"
                                >
                                  {role.name}
                                </Badge>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Td>
                        <Td maxW={{ base: '100px', md: '180px' }}>
                          <Box maxH="60px" overflow="hidden">
                            <PermissionBadges
                              permissions={user.roles?.flatMap(r => r.permissions || [])}
                              maxShow={4}
                            />
                          </Box>
                        </Td>
                        <Td>
                          <Wrap spacing={1}>
                            {!user.roles?.some(r => r.name === 'ADMIN') && (
                              <WrapItem>
                                <IconButton size="sm" colorScheme="red" icon={<FaCrown />} onClick={() => handleAddRole(user.username, 'ADMIN')} title="Admin hüququ ver" aria-label="Admin" />
                              </WrapItem>
                            )}
                            {!user.roles?.some(r => r.name === 'USER') && (
                              <WrapItem>
                                <IconButton size="sm" colorScheme="blue" icon={<FaUser />} onClick={() => handleAddRole(user.username, 'USER')} title="User hüququ ver" aria-label="User" />
                              </WrapItem>
                            )}
                            {!user.roles?.some(r => r.name === 'WORKER') && (
                              <WrapItem>
                                <IconButton size="sm" colorScheme="teal" icon={<FaUserCog />} onClick={() => handleAddRole(user.username, 'WORKER')} title="Worker hüququ ver" aria-label="Worker" />
                              </WrapItem>
                            )}
                            {roles.filter(r => !user.roles?.some(ur => ur.name === r.name)).length > 0 && (
                              <WrapItem>
                                <Tooltip label="Rol əlavə et (məs. MANAGEMENT)">
                                  <Button size="sm" leftIcon={<FaCriticalRole />} colorScheme="cyan" variant="outline" onClick={() => handleOpenAddRoleModal(user)}>
                                    Rol
                                  </Button>
                                </Tooltip>
                              </WrapItem>
                            )}
                            {user.roles?.length > 1 && (
                              <WrapItem>
                                <IconButton size="sm" colorScheme="orange" icon={<FaMinus />} onClick={() => handleRemoveRoleWithSelection(user.username)} title="Hüquq sil" aria-label="Rol sil" />
                              </WrapItem>
                            )}
                            <WrapItem>
                              <IconButton size="sm" colorScheme="purple" icon={<FaKey />} onClick={() => handleResetPassword(user.username)} title="Şifrəni yenilə" aria-label="Şifrə" />
                            </WrapItem>
                            <WrapItem>
                              <IconButton size="sm" colorScheme="red" icon={<FaTrash />} onClick={() => handleDeleteUser(user.username)} title="İstifadəçini sil" aria-label="Sil" />
                            </WrapItem>
                            <WrapItem>
                              <IconButton size="sm" colorScheme="yellow" icon={<FaRegEdit />} onClick={() => handleOpenEditUser(user)} title="İstifadəçini düzənlə" aria-label="Düzənlə" />
                            </WrapItem>
                          </Wrap>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>

          {/* Rolları idarə et - Edit Role section */ }
          <Card bg="white" border="1px" borderColor="gray.200" shadow="sm">
            <CardBody>
              <Heading size="sm" mb={3} color="gray.700">Rollar və permission-lar</Heading>
              <Wrap spacing={3}>
                {roles.map((role) => (
                  <WrapItem key={role.name}>
                    <HStack>
                      <Badge colorScheme={role.name === 'ADMIN' ? 'red' : role.name === 'WORKER' ? 'teal' : 'blue'} fontSize="sm">{role.name}</Badge>
                      <Button size="xs" leftIcon={<FaRegEdit />} colorScheme="gray" variant="outline" onClick={() => handleOpenEditRole(role)}>
                        Düzənlə
                      </Button>
                    </HStack>
                  </WrapItem>
                ))}
              </Wrap>
            </CardBody>
          </Card>
        </VStack>

        {/* Add User Modal */ }
        <Modal isOpen={ isOpen } onClose={ onClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Yeni İşçi Əlavə Et</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={ 4 }>
                <FormControl isRequired>
                  <FormLabel>İstifadəçi Adı</FormLabel>
                  <Input
                    name="username"
                    value={ formData.username }
                    onChange={ handleInputChange }
                    placeholder="İstifadəçi adını daxil edin"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={ formData.email }
                    onChange={ handleInputChange }
                    placeholder="Email ünvanını daxil edin"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Şifrə</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={ formData.password }
                    onChange={ handleInputChange }
                    placeholder="Şifrəni daxil edin"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefon Nömrəsi</FormLabel>
                  <Input
                    name="phoneNumber"
                    value={ formData.phoneNumber }
                    onChange={ handleInputChange }
                    placeholder="+994501234567"
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={ 3 } onClick={ onClose }>
                Ləğv Et
              </Button>
              <Button colorScheme="blue" onClick={ handleSubmit }>
                Əlavə Et
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Role Removal Modal */ }
        <Modal isOpen={ isRoleModalOpen } onClose={ onRoleModalClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Hüquq Sil</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={ 4 }>
                <Text>
                  <strong>{ selectedUserForRole?.username }</strong> istifadəçisindən hansı hüququ silmək istəyirsiniz?
                </Text>

                <FormControl>
                  <FormLabel>Hüquq Seçin</FormLabel>
                  <Select
                    value={typeof selectedRoleToRemove === 'string' ? selectedRoleToRemove : selectedRoleToRemove?.name}
                    onChange={(e) => setSelectedRoleToRemove(e.target.value)}
                  >
                    {selectedUserForRole?.roles.map((role) => (
                      <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={ 3 } onClick={ onRoleModalClose }>
                Ləğv Et
              </Button>
              <Button colorScheme="red" onClick={ handleConfirmRoleRemoval }>
                Sil
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Password Reset Modal */ }
        <Modal isOpen={ isPasswordModalOpen } onClose={ onPasswordModalClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Şifrə Yenilə</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={ 4 }>
                <Text>
                  <strong>{ selectedUserForPassword?.username }</strong> istifadəçisi üçün yeni şifrə təyin edin
                </Text>

                <FormControl isRequired>
                  <FormLabel>Yeni Şifrə</FormLabel>
                  <Input
                    type="password"
                    value={ newPassword }
                    onChange={ (e) => setNewPassword(e.target.value) }
                    placeholder="Yeni şifrəni daxil edin"
                  />
                </FormControl>

                <Text fontSize="sm" color="gray.500">
                  Şifrə ən azı 6 simvol olmalıdır
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={ 3 } onClick={ onPasswordModalClose }>
                Ləğv Et
              </Button>
              <Button colorScheme="purple" onClick={ handleConfirmPasswordReset }>
                Yenilə
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        { /*Create Role*/ }

        <Modal isOpen={ isCreateRoleOpen } onClose={ onCreateRoleClose } size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Yeni Role Yarat</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={ 5 } align="stretch">
                <FormControl isRequired>
                  <FormLabel>Role Adı</FormLabel>
                  <Input
                    placeholder="Məs: GUEST, MANAGER"
                    value={ roleName }
                    onChange={ (e) => setRoleName(e.target.value) }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Permission-lar</FormLabel>

                  <SimpleGrid columns={ { base: 1, md: 2 } } spacing={ 3 }>
                    { permissions.map(p => (
                      <Checkbox
                        key={ p.name }
                        isChecked={ selectedPermissions.includes(p.name) }
                        onChange={ () => togglePermission(p.name) }
                      >
                        { p.name }
                      </Checkbox>
                    )) }
                  </SimpleGrid>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateRoleClose}>Ləğv Et</Button>
              <Button colorScheme="blue" onClick={handleCreatePermissionsToRole}>Yarat</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit User Modal */ }
        <Modal isOpen={isEditUserOpen} onClose={onEditUserClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>İstifadəçini düzənlə</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editUser && (
                <VStack spacing={4}>
                  <FormControl isReadOnly>
                    <FormLabel>İstifadəçi adı</FormLabel>
                    <Input value={editUser.username} isReadOnly bg="gray.50" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Görünən ad</FormLabel>
                    <Input
                      value={editUserForm.displayName}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="İstəyə görə"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={editUserForm.phoneNumber}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+994501234567"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Yeni şifrə (boş saxlasanız dəyişməz)</FormLabel>
                    <Input
                      type="password"
                      value={editUserForm.password}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="İstəyə görə"
                    />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditUserClose}>Ləğv Et</Button>
              <Button colorScheme="blue" onClick={handleSaveEditUser}>Saxla</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Role Modal */ }
        <Modal isOpen={isEditRoleOpen} onClose={onEditRoleClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Rolun permission-larını düzənlə: {editRoleName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isReadOnly mb={4}>
                <FormLabel>Rol</FormLabel>
                <Input value={editRoleName} isReadOnly bg="gray.50" />
              </FormControl>
              <FormControl>
                <FormLabel>Permission-lar</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {permissions.map((p) => (
                    <Checkbox
                      key={p.name}
                      isChecked={editRolePermissions.includes(p.name)}
                      onChange={() => toggleEditRolePermission(p.name)}
                    >
                      {p.name}
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditRoleClose}>Ləğv Et</Button>
              <Button colorScheme="teal" onClick={handleSaveEditRole}>Saxla</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Rol əlavə et (istənilən rol, məs. MANAGEMENT) */ }
        <Modal isOpen={isAddRoleModalOpen} onClose={onAddRoleModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>İstifadəçiyə rol əlavə et</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {addRoleForUser && (
                <VStack spacing={4} align="stretch">
                  <FormControl isReadOnly>
                    <FormLabel>İstifadəçi</FormLabel>
                    <Input value={addRoleForUser.username} isReadOnly bg="gray.50" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Rol seçin</FormLabel>
                    <Select
                      value={selectedRoleToAdd}
                      onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                      placeholder="Rol seçin..."
                    >
                      {availableRolesForAdd.map((r) => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <Text fontSize="sm" color="gray.500">
                    Məs: MANAGEMENT, və s. — əvvəl &quot;Yeni Rol Əlavə Et&quot; ilə yaratdığınız rollar.
                  </Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddRoleModalClose}>Ləğv Et</Button>
              <Button colorScheme="cyan" onClick={handleConfirmAddRole} isDisabled={!selectedRoleToAdd}>
                Əlavə et
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Container>
    </Layout>
  );
};

export default UsersPage;
