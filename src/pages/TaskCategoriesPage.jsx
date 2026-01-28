import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import taskCategoryService from '../api_services/taskCategoryService';
import Layout from '../layout/Layout';

const TaskCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await taskCategoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: 'Xəta!', description: 'Kateqoriyalar yüklənə bilmədi', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    onOpen();
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name || '', description: category.description || '' });
    onOpen();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name.trim(), description: formData.description?.trim() || '' };
      if (!payload.name) {
        toast({ title: 'Xəta!', description: 'Ad məcburidir', status: 'error' });
        return;
      }
      if (editingCategory) {
        await taskCategoryService.updateCategory(editingCategory.id, payload);
        toast({ title: 'Uğurlu!', description: 'Kateqoriya yeniləndi', status: 'success' });
      } else {
        await taskCategoryService.createCategory(payload);
        toast({ title: 'Uğurlu!', description: 'Kateqoriya yaradıldı', status: 'success' });
      }
      onClose();
      await loadCategories();
    } catch (e) {
      toast({ title: 'Xəta!', description: 'Əməliyyat alınmadı', status: 'error' });
    }
  };

  const confirmDelete = (category) => {
    setDeletingCategory(category);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      await taskCategoryService.deleteCategory(deletingCategory.id);
      toast({ title: 'Uğurlu!', description: 'Kateqoriya silindi', status: 'success' });
      onDeleteClose();
      await loadCategories();
    } catch (e) {
      toast({ title: 'Xəta!', description: 'Silinmə alınmadı', status: 'error' });
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg" color="gray.700">Kateqoriyalar</Heading>
          <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={openCreate}>Yeni Kateqoriya</Button>
        </HStack>

        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
          <Table variant="simple" size="md">
            <Thead bg="blue.50">
              <Tr>
                <Th minW="80px">ID</Th>
                <Th minW="220px">Ad</Th>
                <Th>Haqqında</Th>
                <Th minW="140px">Əməliyyatlar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id} _hover={{ bg: 'blue.50' }}>
                  <Td>{c.id}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.description || '-'}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton size="sm" colorScheme="yellow" icon={<FaEdit />} onClick={() => openEdit(c)} />
                      <IconButton size="sm" colorScheme="red" variant="outline" icon={<FaTrash />} onClick={() => confirmDelete(c)} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {!loading && categories.length === 0 && (
                <Tr>
                  <Td colSpan={4}>Məlumat yoxdur</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Create/Update Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingCategory ? 'Kateqoriyanı Yenilə' : 'Yeni Kateqoriya'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSave}>
                <FormControl isRequired mb={4}>
                  <FormLabel>Ad</FormLabel>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Məs: Vergi" />
                </FormControl>
                <FormControl mb={6}>
                  <FormLabel>Təsvir</FormLabel>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Qısa açıqlama" rows={3} />
                </FormControl>
                <HStack justify="flex-end">
                  <Button onClick={onClose}>Ləğv et</Button>
                  <Button type="submit" colorScheme="blue">Yadda saxla</Button>
                </HStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Dialog */}
        <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Silinsin?</AlertDialogHeader>
              <AlertDialogBody>
                {`"${deletingCategory?.name || ''}" kateqoriyasını silmək istədiyinizə əminsiniz?`}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button onClick={onDeleteClose}>Ləğv et</Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>Sil</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Layout>
  );
};

export default TaskCategoriesPage;


