import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  Flex,
  Divider,
  Icon,
  Spacer
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPlay,
  FaCheck,
  FaEye
} from 'react-icons/fa';
import taskService from '../api_services/taskService';
import companyService from '../api_services/companyService';
import authService from '../api_services/authService';
import taskCategoryService from '../api_services/taskCategoryService';
import Layout from '../layout/Layout';
import { formatDate, formatDateTime, toLocalISOString } from '../utils/dateUtils';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    categoryId: '',
    assignedUsername: '',
    dueDate: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const [selectedComment, setSelectedComment] = useState({ type: '', text: '', title: '' });
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [page, size]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksPage, companiesData, usersData, categoriesData] = await Promise.all([
        taskService.getTasksPage({ page, size, sort: 'createdAt,desc' }),
        companyService.getAllCompanies(),
        authService.getUsersByRole('USER'),
        taskCategoryService.getAllCategories()
      ]);
      setTasks(tasksPage.content || []);
      setTotalPages(tasksPage.totalPages || 0);
      setTotalElements(tasksPage.totalElements || 0);
      setCompanies(companiesData);
      setCategories(categoriesData || []);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Məlumatlar yüklənərkən xəta baş verdi',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title || !formData.companyId || !formData.categoryId) {
        toast({
          title: 'Xəta!',
          description: 'Bütün məcburi sahələri doldurun',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate date format if provided
      if (formData.dueDate) {
        const date = new Date(formData.dueDate);
        if (isNaN(date.getTime())) {
          toast({
            title: 'Xəta!',
            description: 'Düzgün tarix formatı daxil edin',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      // Prepare data for backend
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyId: parseInt(formData.companyId),
        categoryId: parseInt(formData.categoryId),
        assignedUsername: formData.assignedUsername || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      console.log('Prepared task data:', taskData);

      if (isEditMode) {
        // Edit functionality can be added later
        toast({
          title: 'Məlumat',
          description: 'Tapşırıq yeniləmə funksiyası tezliklə əlavə olunacaq',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await taskService.createTask(taskData);
        toast({
          title: 'Uğurlu!',
          description: 'Tapşırıq uğurla yaradıldı',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      loadData();
      resetForm();
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Əməliyyat uğursuz oldu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, { status: newStatus });
      toast({
        title: 'Uğurlu!',
        description: 'Tapşırıq statusu yeniləndi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Status yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(selectedTask.id);
      toast({
        title: 'Uğurlu!',
        description: 'Tapşırıq uğurla silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      loadData();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Tapşırıq silinərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      companyId: '',
      categoryId: '',
      assignedUsername: '',
      dueDate: ''
    });
    setSelectedTask(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    onOpen();
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

  const handleDownloadFile = async (filePath) => {
    try {
      const blob = await taskService.downloadFile(filePath);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Fayl yüklənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openCommentModal = (type, text, title) => {
    setSelectedComment({ type, text, title });
    onCommentOpen();
  };



  return (
    <Layout>
      <Container maxW="container.xl" py={ 8 }>
        <VStack spacing={ 6 } align="stretch">
          <HStack justify="space-between">
            <Heading size="lg" color="gray.700">
              Tapşırıqlar
            </Heading>
            <Button
              leftIcon={ <FaPlus /> }
              colorScheme="blue"
              onClick={ openCreateModal }
            >
              Yeni Tapşırıq
            </Button>
          </HStack>

          <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
            <HStack p={4} borderBottom="1px" borderColor="gray.200" spacing={4} align="center">
              <Text fontSize="sm" color="gray.600">Səhifə ölçüsü:</Text>
              <Select value={ size } onChange={ handlePageSizeChange } width="auto">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={100}>100</option>
              </Select>
              <Spacer />
              <Text fontSize="sm" color="gray.600">
                Cəmi: { totalElements }
              </Text>
            </HStack>
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="blue.50">
                  <Tr>
                    <Th minW="180px" fontSize="sm" fontWeight="bold" color="gray.700">Başlıq</Th>
                    <Th minW="140px" fontSize="sm" fontWeight="bold" color="gray.700">Şirkət</Th>
                    <Th minW="120px" fontSize="sm" fontWeight="bold" color="gray.700">Kateqoriya</Th>
                    <Th minW="120px" fontSize="sm" fontWeight="bold" color="gray.700">İstifadəçi</Th>
                    <Th minW="100px" fontSize="sm" fontWeight="bold" color="gray.700">Status</Th>
                    <Th minW="120px" fontSize="sm" fontWeight="bold" color="gray.700">Bitmə/Tamamlanma Tarixi</Th>
                    <Th minW="120px" fontSize="sm" fontWeight="bold" color="gray.700">Son Yenilənmə</Th>
                    <Th minW="200px" fontSize="sm" fontWeight="bold" color="gray.700">İşçi Şərhi</Th>
                    <Th minW="200px" fontSize="sm" fontWeight="bold" color="gray.700">Tamamlama Şərhi</Th>
                    <Th minW="140px" fontSize="sm" fontWeight="bold" color="gray.700">Fayl</Th>
                    <Th minW="100px" fontSize="sm" fontWeight="bold" color="gray.700">Əməliyyatlar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  { tasks.map((task, index) => (
                    <Tr key={ task.id } _hover={ { bg: 'blue.50' } } bg={ index % 2 === 0 ? 'white' : 'gray.50' }>
                      <Td fontWeight="semibold" maxW="180px" borderRight="1px" borderColor="gray.200">
                        <Tooltip label={ task.title } placement="top">
                          <Text noOfLines={ 1 } fontSize="sm">{ task.title }</Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="140px" borderRight="1px" borderColor="gray.200">
                        <Tooltip label={ task.company?.name || '-' } placement="top">
                          <Text noOfLines={ 1 } fontSize="sm">{ task.company?.name || '-' }</Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="120px" borderRight="1px" borderColor="gray.200">
                        <Tooltip 
                          label={
                            task.category ? 
                              (task.category.description ? 
                                `${task.category.name}\n\n${task.category.description}` : 
                                task.category.name
                              ) : 
                              'Kateqoriya məlumatı yoxdur'
                          }
                          placement="top"
                          hasArrow
                          bg="gray.800"
                          color="white"
                          borderRadius="md"
                          p={3}
                          maxW="300px"
                          whiteSpace="pre-wrap"
                        >
                          <Text noOfLines={ 1 } fontSize="sm" cursor="help">
                            { task.category?.name || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="120px" borderRight="1px" borderColor="gray.200">
                        <Text noOfLines={ 1 } fontSize="sm" fontWeight="medium">{ task.assignedUser?.username || '-' }</Text>
                      </Td>
                      <Td borderRight="1px" borderColor="gray.200">{ getStatusBadge(task.status) }</Td>
                      <Td borderRight="1px" borderColor="gray.200">
                        <Tooltip 
                          label={task.status === 'COMPLETED' ? 'Tamamlanma tarixi' : 'Bitmə tarixi'} 
                          placement="top"
                        >
                          <Text fontSize="sm">
                            {task.status === 'COMPLETED' 
                              ? (task.completedAt ? formatDateTime(task.completedAt) : 'Yoxdur')
                              : (task.dueDate ? formatDate(task.dueDate) : 'Yoxdur')
                            }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td borderRight="1px" borderColor="gray.200">
                        <Text fontSize="sm">{ formatDateTime(task.updatedAt) }</Text>
                      </Td>
                      <Td maxW="200px" borderRight="1px" borderColor="gray.200">
                        { task.workerComment ? (
                          <Tooltip label="Tam şərhi görmək üçün klikləyin" placement="top">
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={ () => openCommentModal('worker', task.workerComment, task.title) }
                              textAlign="left"
                              justifyContent="flex-start"
                              height="auto"
                              p={ 3 }
                              width="100%"
                              _hover={ { bg: 'blue.100' } }
                            >
                              <VStack align="start" spacing={ 1 } width="100%">
                                <Text fontSize="sm" fontWeight="medium" color="blue.600">
                                  İşçi Şərhi:
                                </Text>
                                <Text fontSize="sm" noOfLines={ 3 } textAlign="left" color="gray.700">
                                  { task.workerComment }
                                </Text>
                                <Text fontSize="xs" color="blue.500" fontWeight="medium">
                                  Tam şərhi görmək üçün klikləyin →
                                </Text>
                              </VStack>
                            </Button>
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.400" fontStyle="italic">Şərh yoxdur</Text>
                        ) }
                      </Td>
                      <Td maxW="200px" borderRight="1px" borderColor="gray.200">
                        { task.completionComment ? (
                          <Tooltip label="Tam şərhi görmək üçün klikləyin" placement="top">
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              onClick={ () => openCommentModal('completion', task.completionComment, task.title) }
                              textAlign="left"
                              justifyContent="flex-start"
                              height="auto"
                              p={ 3 }
                              width="100%"
                              _hover={ { bg: 'green.100' } }
                            >
                              <VStack align="start" spacing={ 1 } width="100%">
                                <Text fontSize="sm" fontWeight="medium" color="green.600">
                                  Tamamlama Şərhi:
                                </Text>
                                <Text fontSize="sm" noOfLines={ 3 } textAlign="left" color="gray.700">
                                  { task.completionComment }
                                </Text>
                                <Text fontSize="xs" color="green.500" fontWeight="medium">
                                  Tam şərhi görmək üçün klikləyin →
                                </Text>
                              </VStack>
                            </Button>
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.400" fontStyle="italic">Şərh yoxdur</Text>
                        ) }
                      </Td>
                      <Td borderRight="1px" borderColor="gray.200">
                        { task.completionFileName ? (
                          <Tooltip label="Faylı yüklə" placement="top">
                            <Button
                              size="sm"
                              colorScheme="purple"
                              variant="outline"
                              onClick={ () => handleDownloadFile(task.completionFilePath) }
                              width="100%"
                            >
                              <VStack spacing={ 1 }>
                                <Text fontSize="xs" fontWeight="medium" color="purple.600">
                                  📎 Fayl
                                </Text>
                                <Text fontSize="xs" noOfLines={ 1 } color="gray.600">
                                  { task.completionFileName }
                                </Text>
                              </VStack>
                            </Button>
                          </Tooltip>
                        ) : (
                          <Text fontSize="sm" color="gray.400" fontStyle="italic">Fayl yoxdur</Text>
                        ) }
                      </Td>
                      <Td>
                        <HStack spacing={ 2 } justify="center">
                          { task.status === 'PENDING' && (
                            <Tooltip label="İşə başla" placement="top">
                              <IconButton
                                size="sm"
                                icon={ <FaPlay /> }
                                colorScheme="yellow"
                                variant="solid"
                                onClick={ () => handleStatusUpdate(task.id, 'ACTIVE') }
                              />
                            </Tooltip>
                          ) }
                          { task.status === 'ACTIVE' && (
                            <Tooltip label="Tamamla" placement="top">
                              <IconButton
                                size="sm"
                                icon={ <FaCheck /> }
                                colorScheme="green"
                                variant="solid"
                                onClick={ () => handleStatusUpdate(task.id, 'COMPLETED') }
                              />
                            </Tooltip>
                          ) }
                          <Tooltip label="Sil" placement="top">
                            <IconButton
                              size="sm"
                              icon={ <FaTrash /> }
                              colorScheme="red"
                              variant="outline"
                              onClick={ () => {
                                setSelectedTask(task);
                                onDeleteOpen();
                              } }
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  )) }
                </Tbody>
              </Table>
            </Box>
            <HStack p={4} justify="space-between" borderTop="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600">
                Səhifə { totalPages === 0 ? 0 : page + 1 } / { totalPages }
              </Text>
              <HStack spacing={2}>
                <Button size="sm" onClick={() => handlePageChange(0)} isDisabled={ page === 0 }>
                  « İlk
                </Button>
                <Button size="sm" onClick={() => handlePageChange(page - 1)} isDisabled={ page === 0 }>
                  ‹ Əvvəlki
                </Button>
                <Button size="sm" onClick={() => handlePageChange(page + 1)} isDisabled={ page >= totalPages - 1 }>
                  Sonrakı ›
                </Button>
                <Button size="sm" onClick={() => handlePageChange(totalPages - 1)} isDisabled={ page >= totalPages - 1 }>
                  Son »
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>

        {/* Create Modal */ }
        <Modal isOpen={ isOpen } onClose={ onClose } size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Yeni Tapşırıq
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <form onSubmit={ handleSubmit }>
                <VStack spacing={ 4 }>
                  <FormControl isRequired>
                    <FormLabel>Başlıq</FormLabel>
                    <Input
                      name="title"
                      value={ formData.title }
                      onChange={ handleInputChange }
                      placeholder="Tapşırıq başlığını daxil edin"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Təsvir</FormLabel>
                    <Textarea
                      name="description"
                      value={ formData.description }
                      onChange={ handleInputChange }
                      placeholder="Tapşırıq haqqında məlumat"
                      rows={ 3 }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Şirkət</FormLabel>
                    <Select
                      name="companyId"
                      value={ formData.companyId }
                      onChange={ handleInputChange }
                      placeholder="Şirkət seçin"
                    >
                      { companies.map((company) => (
                        <option key={ company.id } value={ company.id }>
                          { company.name }
                        </option>
                      )) }
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Kateqoriya</FormLabel>
                    <Select
                      name="categoryId"
                      value={ formData.categoryId }
                      onChange={ handleInputChange }
                      placeholder="Kateqoriya seçin"
                    >
                      { categories.map((category) => (
                        <option key={ category.id } value={ category.id }>
                          { category.name }
                        </option>
                      )) }
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>İstifadəçi</FormLabel>
                    <Select
                      name="assignedUsername"
                      value={ formData.assignedUsername }
                      onChange={ handleInputChange }
                      placeholder="İstifadəçi seçin"
                    >
                      { users.map((user) => (
                        <option key={ user.username } value={ user.username }>
                          { user.username } ({ user.email })
                        </option>
                      )) }
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Son Tarix</FormLabel>
                    <Input
                      name="dueDate"
                      type="datetime-local"
                      value={ toLocalISOString(formData.dueDate) }
                      onChange={ handleInputChange }
                      placeholder="Tarix və saat seçin"
                    />
                    <Text fontSize="sm" color="gray.500" mt={ 1 }>
                      Tarix və saat seçin (məcburi deyil)
                    </Text>
                  </FormControl>

                  <HStack spacing={ 4 } width="full" justify="flex-end">
                    <Button onClick={ onClose }>Ləğv Et</Button>
                    <Button type="submit" colorScheme="blue">
                      Yarat
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation */ }
        <AlertDialog
          isOpen={ isDeleteOpen }
          leastDestructiveRef={ cancelRef }
          onClose={ onDeleteClose }
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Tapşırığı Sil
              </AlertDialogHeader>

              <AlertDialogBody>
                "{ selectedTask?.title }" tapşırığını silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={ cancelRef } onClick={ onDeleteClose }>
                  Ləğv Et
                </Button>
                <Button colorScheme="red" onClick={ handleDelete } ml={ 3 }>
                  Sil
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Comment View Modal */ }
        <Modal isOpen={ isCommentOpen } onClose={ onCommentClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              { selectedComment.type === 'worker' ? 'İşçi Şərhi' : 'Tamamlama Şərhi' }
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <VStack spacing={ 4 } align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={ 2 }>Tapşırıq:</Text>
                  <Text color="gray.600" fontSize="sm">{ selectedComment.title }</Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="medium" mb={ 2 }>
                    { selectedComment.type === 'worker' ? 'İşçi Şərhi:' : 'Tamamlama Şərhi:' }
                  </Text>
                  <Box
                    bg="gray.50"
                    p={ 4 }
                    borderRadius="md"
                    border="1px"
                    borderColor="gray.200"
                    maxH="300px"
                    overflowY="auto"
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      { selectedComment.text }
                    </Text>
                  </Box>
                </Box>

                <HStack spacing={ 4 } width="full" justify="flex-end">
                  <Button onClick={ onCommentClose }>Bağla</Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default TasksPage;
