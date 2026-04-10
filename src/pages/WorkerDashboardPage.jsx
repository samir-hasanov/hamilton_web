import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
} from '@chakra-ui/react';
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaCheck,
  FaEye,
  FaBell,
  FaSignOutAlt,
} from 'react-icons/fa';
import Layout from '../layout/Layout';
import authService from '../api_services/authService';
import taskService from '../api_services/taskService';
import companyService from '../api_services/companyService';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime, isOverdue } from '../utils/dateUtils';
import CurrencyConverter from '../components/CurrencyConverter';
import { userDisplayName } from '../utils/userDisplayName';
import HoverPreviewAvatar from '../components/HoverPreviewAvatar';

const WorkerDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [welcomeAvatarUrl, setWelcomeAvatarUrl] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [myCompanies, setMyCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isStartModal, setIsStartModal] = useState(false);
  const [isCompleteModal, setIsCompleteModal] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authService.getMe();
        if (!cancelled) setUser(authService.getCurrentUser());
      } catch {
        if (!cancelled) setUser(authService.getCurrentUser());
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadMyTasks();
    loadMyCompanies();
  }, [navigate, page, size, user?.username]);

  useEffect(() => {
    if (!user?.profileImagePresent) {
      setWelcomeAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = await authService.fetchProfileAvatarObjectUrl();
        if (cancelled || !url) return;
        setWelcomeAvatarUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        if (!cancelled) {
          setWelcomeAvatarUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.profileImagePresent, user?.username]);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const tasksPage = await taskService.getMyTasksPage({ page, size, sort: 'createdAt,desc' });
      setMyTasks(tasksPage.content || []);
      setTotalPages(tasksPage.totalPages || 0);
      setTotalElements(tasksPage.totalElements || 0);
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Tapşırıqlar yüklənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setSize(newSize);
    setPage(0);
  };

  const loadMyCompanies = async () => {
    try {
      const companies = await companyService.getMyCompanies();
      setMyCompanies(companies);
    } catch (error) {
      // silent fail to avoid noise
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await taskService.updateTaskStatus(selectedTask.id, {
        status: newStatus,
        comment: comment
      });
      toast({
        title: 'Uğurlu!',
        description: 'Tapşırıq statusu yeniləndi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setComment('');
      setNewStatus('');
      setSelectedTask(null);
      loadMyTasks();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Status yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Tapşırığı başlatma
  const handleStartTask = async () => {
    try {
      await taskService.startTask(selectedTask.id, comment);
      toast({
        title: 'Uğurlu!',
        description: 'Tapşırıq başladıldı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setComment('');
      setSelectedTask(null);
      setIsStartModal(false);
      loadMyTasks();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Tapşırıq başladılarkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Tapşırığı tamamlama
  const handleCompleteTask = async () => {
    try {
      await taskService.completeTask(selectedTask.id, comment, selectedFile);
      toast({
        title: 'Uğurlu!',
        description: 'Tapşırıq tamamlandı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setComment('');
      setSelectedFile(null);
      setSelectedTask(null);
      setIsCompleteModal(false);
      loadMyTasks();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Tapşırıq tamamlanarkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fayl seçimi
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Modal açma funksiyaları
  const openStartModal = (task) => {
    setSelectedTask(task);
    setComment('');
    setIsStartModal(true);
    onOpen();
  };

  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setComment('');
    setSelectedFile(null);
    setIsCompleteModal(true);
    onOpen();
  };

  const openStatusModal = (task, status) => {
    setSelectedTask(task);
    setNewStatus(status);
    setComment('');
    onOpen();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'gray', text: 'Gözləyir' },
      'ACTIVE': { color: 'yellow', text: 'Aktiv' },
      'COMPLETED': { color: 'green', text: 'Tamamlanmış' }
    };
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge colorScheme={ config.color }>{ config.text }</Badge>;
  };



  if (!user) {
    return null;
  }

  const pendingTasks = myTasks.filter(task => task.status === 'PENDING');
  const activeTasks = myTasks.filter(task => task.status === 'ACTIVE');
  const completedTasks = myTasks.filter(task => task.status === 'COMPLETED');
  const overdueTasks = myTasks.filter(task => task.isOverdue);

  return (
    <Layout>
      <Container maxW="container.xl" py={ 8 }>
        <VStack spacing={ 8 } align="stretch">
          {/* Header */ }
          <Box>
            <HStack justify="space-between" align="center">
              <HStack align="center" spacing={ 4 }>
                <HoverPreviewAvatar
                  size="lg"
                  src={ welcomeAvatarUrl || undefined }
                  name={ userDisplayName(user) }
                  onError={ () => {
                    setWelcomeAvatarUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                  } }
                />
                <VStack align="start" spacing={ 2 }>
                  <Heading size="lg" color="gray.700">
                    Xoş gəlmisiniz, { userDisplayName(user) }!
                  </Heading>
                  <Text color="gray.500">
                    Sizin iş masanız · { user.username }
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={ 4 }>
                <CurrencyConverter />
                <Button
                  leftIcon={ <Icon as={ FaBell } /> }
                  variant="ghost"
                  colorScheme="blue"
                >
                  Bildirişlər
                </Button>
                <Button
                  onClick={ handleLogout }
                  variant="outline"
                  colorScheme="red"
                  leftIcon={ <Icon as={ FaSignOutAlt } /> }
                >
                  Çıxış
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Stats Cards */ }
          <SimpleGrid columns={ { base: 1, md: 2, lg: 4 } } spacing={ 6 }>
            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Ümumi Tapşırıqlar
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">{ myTasks.length }</StatNumber>
                  <StatHelpText>
                    <Icon as={ FaTasks } color="blue.500" mr={ 2 } />
                    Sizə təyin edilən
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Gözləyən
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="gray.500">{ pendingTasks.length }</StatNumber>
                  <StatHelpText>
                    <Icon as={ FaClock } color="gray.500" mr={ 2 } />
                    Başlanılmayan
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Aktiv
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.500">{ activeTasks.length }</StatNumber>
                  <StatHelpText>
                    <Icon as={ FaClock } color="yellow.500" mr={ 2 } />
                    İcra olunma mərhələsində
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Tamamlanmış
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">{ completedTasks.length }</StatNumber>
                  <StatHelpText>
                    <Icon as={ FaCheckCircle } color="green.500" mr={ 2 } />
                    Uğurla tamamlanmış
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* My Tasks Table */ }
          <Card bg="white" border="1px" borderColor="gray.200">
            <CardHeader>
              <Heading size="md" color="gray.700">
                Mənim Tapşırıqlarım
              </Heading>
            </CardHeader>
            <CardBody>
              <HStack mb={4} spacing={4} align="center">
                <Text fontSize="sm" color="gray.600">Səhifə ölçüsü:</Text>
                <Select value={ size } onChange={ handlePageSizeChange } width="auto">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                  <option value={100}>100</option>
                </Select>
                <Text fontSize="sm" color="gray.600" ml="auto">Cəmi: { totalElements }</Text>
              </HStack>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Başlıq</Th>
                      <Th>Şirkət</Th>
                      <Th>Voen</Th>
                      <Th>Asan</Th>
                      <Th>Kateqoriya</Th>
                      <Th>Status</Th>
                      <Th>Son Tarix</Th>
                      <Th>Əməliyyatlar</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    { myTasks.length > 0 ? (
                      myTasks.map((task) => (
                        <Tr key={ task.id }>
                          <Td fontWeight="medium">{ task.title }</Td>
                          <Td>{ task.company?.name || '-' }</Td>
                          <Td>{ task.company?.taxNumber || '-' }</Td>
                          <Td>{ task.company?.taxType || '-' }</Td>
                          <Td>{ task.category?.name || '-' }</Td>
                          <Td>{ getStatusBadge(task.status) }</Td>
                          <Td>{ formatDate(task.dueDate) }</Td>
                          <Td>
                            <HStack spacing={ 2 }>
                              { task.status === 'PENDING' && (
                                <IconButton
                                  size="sm"
                                  icon={ <FaPlay /> }
                                  colorScheme="yellow"
                                  variant="ghost"
                                  onClick={ () => openStartModal(task) }
                                  title="İşə başla"
                                />
                              ) }
                              { task.status === 'ACTIVE' && (
                                <IconButton
                                  size="sm"
                                  icon={ <FaCheck /> }
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={ () => openCompleteModal(task) }
                                  title="Tamamla"
                                />
                              ) }
                              <IconButton
                                size="sm"
                                icon={ <FaEye /> }
                                colorScheme="blue"
                                variant="ghost"
                                onClick={ () => {
                                  setSelectedTask(task);
                                  setNewStatus(task.status);
                                  setComment('');
                                  onOpen();
                                } }
                                title="Detalları gör"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={ 6 } textAlign="center" color="gray.500">
                          Hələ sizə tapşırıq təyin edilməyib
                        </Td>
                      </Tr>
                    ) }
                  </Tbody>
                </Table>
              </Box>
              <HStack mt={4} justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Səhifə { totalPages === 0 ? 0 : page + 1 } / { totalPages }
                </Text>
                <HStack spacing={2}>
                  <Button size="sm" onClick={() => handlePageChange(0)} isDisabled={ page === 0 }>« İlk</Button>
                  <Button size="sm" onClick={() => handlePageChange(page - 1)} isDisabled={ page === 0 }>‹ Əvvəlki</Button>
                  <Button size="sm" onClick={() => handlePageChange(page + 1)} isDisabled={ page >= totalPages - 1 }>Sonrakı ›</Button>
                  <Button size="sm" onClick={() => handlePageChange(totalPages - 1)} isDisabled={ page >= totalPages - 1 }>Son »</Button>
                </HStack>
              </HStack>
            </CardBody>
          </Card>

          {/* My Companies Table */ }
          <Card bg="white" border="1px" borderColor="gray.200">
            <CardHeader>
              <Heading size="md" color="gray.700">
                Mənim Şirkətlərim
              </Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Şirkət</Th>
                      <Th>VOEN</Th>
                      <Th>AsanId</Th>
                      <Th>Son Yoxlanış</Th>
                      <Th>Public</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    { myCompanies.length > 0 ? (
                      myCompanies.map(c => (
                        <Tr key={ c.id }>
                          <Td fontWeight="medium">{ c.name }</Td>
                          <Td>{ c.taxNumber || '-' }</Td>
                          <Td>{ c.asanId || '-' }</Td>
                          <Td>{ formatDate(c.lastCheckDate) }</Td>
                          <Td>
                            <Badge colorScheme={ c.isPublic ? 'green' : 'gray' }>
                              { c.isPublic ? 'Ümumi' : 'Şəxsi' }
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={ 4 } textAlign="center" color="gray.500">
                          Sizə təhkim edilmiş və ya ümumi şirkət yoxdur
                        </Td>
                      </Tr>
                    ) }
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>

        {/* Status Update Modal */ }
        <Modal isOpen={ isOpen && !isStartModal && !isCompleteModal } onClose={ onClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              { selectedTask?.status === 'PENDING' ? 'İşə Başla' :
                selectedTask?.status === 'ACTIVE' ? 'Tapşırığı Tamamla' : 'Status Yenilə' }
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <VStack spacing={ 4 }>
                <Box>
                  <Text fontWeight="medium" mb={ 2 }>Tapşırıq:</Text>
                  <Text color="gray.600">{ selectedTask?.title }</Text>
                </Box>

                <FormControl>
                  <FormLabel>Şərh (İstəyə görə)</FormLabel>
                  <Textarea
                    value={ comment }
                    onChange={ (e) => setComment(e.target.value) }
                    placeholder="Status dəyişikliyi haqqında şərh əlavə edin..."
                    rows={ 3 }
                  />
                </FormControl>

                <HStack spacing={ 4 } width="full" justify="flex-end">
                  <Button onClick={ onClose }>Ləğv Et</Button>
                  <Button
                    colorScheme={ newStatus === 'ACTIVE' ? 'yellow' : 'green' }
                    onClick={ handleStatusUpdate }
                  >
                    { newStatus === 'ACTIVE' ? 'İşə Başla' :
                      newStatus === 'COMPLETED' ? 'Tamamla' : 'Yenilə' }
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Start Task Modal */ }
        <Modal isOpen={ isOpen && isStartModal } onClose={ onClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>İşə Başla</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <VStack spacing={ 4 }>
                <Box>
                  <Text fontWeight="medium" mb={ 2 }>Tapşırıq:</Text>
                  <Text color="gray.600">{ selectedTask?.title }</Text>
                </Box>

                <FormControl>
                  <FormLabel>Şərh (İstəyə görə)</FormLabel>
                  <Textarea
                    value={ comment }
                    onChange={ (e) => setComment(e.target.value) }
                    placeholder="İşə başlamaq haqqında şərh əlavə edin..."
                    rows={ 3 }
                  />
                </FormControl>

                <HStack spacing={ 4 } width="full" justify="flex-end">
                  <Button onClick={ onClose }>Ləğv Et</Button>
                  <Button colorScheme="yellow" onClick={ handleStartTask }>
                    İşə Başla
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Complete Task Modal */ }
        <Modal isOpen={ isOpen && isCompleteModal } onClose={ onClose } size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Tapşırığı Tamamla</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <VStack spacing={ 4 }>
                <Box>
                  <Text fontWeight="medium" mb={ 2 }>Tapşırıq:</Text>
                  <Text color="gray.600">{ selectedTask?.title }</Text>
                </Box>

                <FormControl>
                  <FormLabel>Şərh (İstəyə görə)</FormLabel>
                  <Textarea
                    value={ comment }
                    onChange={ (e) => setComment(e.target.value) }
                    placeholder="İşin tamamlanması haqqında şərh əlavə edin..."
                    rows={ 3 }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tamamlama Faylı (İstəyə görə)</FormLabel>
                  <input
                    type="file"
                    onChange={ handleFileChange }
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    style={ {
                      padding: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      width: '100%'
                    } }
                  />
                  <Text fontSize="sm" color="gray.500" mt={ 1 }>
                    Dəstəklənən formatlar: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX
                  </Text>
                </FormControl>

                <HStack spacing={ 4 } width="full" justify="flex-end">
                  <Button onClick={ onClose }>Ləğv Et</Button>
                  <Button colorScheme="green" onClick={ handleCompleteTask }>
                    Tamamla
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default WorkerDashboardPage;
