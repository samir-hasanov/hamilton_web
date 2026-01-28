import React, { useState, useEffect } from 'react';
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
  useDisclosure,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  Badge as ChakraBadge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Checkbox,
  Spinner
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaEye,
  FaFileImport,
  FaUsers,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import companyService from '../api_services/companyService';
import scheduledTaskService from '../api_services/scheduledTaskService';
import taskCategoryService from '../api_services/taskCategoryService';
import userService from '../api_services/userService';
import Layout from '../layout/Layout';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [voenFilter, setVoenFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortByLastCheckDate, setSortByLastCheckDate] = useState(true); // Son yoxlanış tarixinə görə sıralama
  const [selectedCompanies, setSelectedCompanies] = useState([]); // Seçilmiş şirkətlər
  const [selectAll, setSelectAll] = useState(false); // Hamısını seç
  const [bulkTaskForm, setBulkTaskForm] = useState({
    categoryId: '',
    assignedUsername: '',
    title: '',
    description: '',
    delayMinutes: '',
    delayHours: '',
    delayDays: '',
    delayWeeks: '',
    executionDate: ''
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeMode, setTimeMode] = useState('delay'); // 'delay' və ya 'exact'
  const [formData, setFormData] = useState({
    name: '',
    taxNumber: '',
    accountant: '',
    asanId: '',
    pins: '',
    statisticalCode: '',
    column2: '',
    taxType: '',
    lastCheckDate: '',
    status: '',
    complianceDate: '',
    notes: '',
    bank: '',
    column1: '',
    bankCurator: '',
    otherNumbers: '',
    cashStatus: '',
    ygbStatus: '',
    certificateDate: '',
    notes2: '',
    activityCodes: ''
  });

  // Tarix dəyişdirmə üçün state
  const [selectedDateCompany, setSelectedDateCompany] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDateOpen, onOpen: onDateOpen, onClose: onDateClose } = useDisclosure();
  const { isOpen: isBulkTaskOpen, onOpen: onBulkTaskOpen, onClose: onBulkTaskClose } = useDisclosure();
  const cancelRef = React.useRef();
  const fileInputRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    setIsLoading(true)
    loadCompanies();
    loadCategories();
    loadUsers();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await taskCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Kateqoriyalar yüklənərkən xəta:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Yalnız USER roluna sahib işçiləri gətir
      const data = await userService.getUsersByRole('USER');
      setUsers(data);
    } catch (error) {
      console.error('İstifadəçilər yüklənərkən xəta:', error);
    }
  };

  const loadCompanies = async (filters = {}) => {
    try {
      setIsLoading(true);
      const data = await companyService.getAllCompanies(filters);
      setCompanies(data);
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Şirkətlər yüklənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    await loadCompanies({ voen: voenFilter });
  };

  const clearSearch = async () => {
    setVoenFilter('');
    await loadCompanies();
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
      if (isEditMode) {
        // Tarixi düzgün format et
        const updateData = {
          ...formData,
          lastCheckDate: formData.lastCheckDate ? new Date(formData.lastCheckDate).toISOString() : null
        };
        await companyService.updateCompanyFull(selectedCompany.id, updateData);
        toast({
          title: 'Uğurlu!',
          description: 'Şirkət uğurla yeniləndi',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Tarixi düzgün format et
        const createData = {
          ...formData,
          lastCheckDate: formData.lastCheckDate ? new Date(formData.lastCheckDate).toISOString() : null
        };
        await companyService.createCompany(createData);
        toast({
          title: 'Uğurlu!',
          description: 'Şirkət uğurla yaradıldı',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      loadCompanies();
      resetForm();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Əməliyyat uğursuz oldu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      taxNumber: company.taxNumber || '',
      accountant: company.accountant || '',
      asanId: company.asanId || '',
      pins: company.pins || '',
      statisticalCode: company.statisticalCode || '',
      column2: company.column2 || '',
      taxType: company.taxType || '',
      lastCheckDate: company.lastCheckDate ? formatDateForInput(company.lastCheckDate) : '',
      status: company.status || '',
      complianceDate: normalizeDateString(company.complianceDate || ''),
      notes: company.notes || '',
      bank: company.bank || '',
      column1: company.column1 || '',
      bankCurator: company.bankCurator || '',
      otherNumbers: company.otherNumbers || '',
      cashStatus: company.cashStatus || '',
      ygbStatus: company.ygbStatus || '',
      certificateDate: normalizeDateString(company.certificateDate || ''),
      notes2: company.notes2 || '',
      activityCodes: company.activityCodes || ''
    });
    setIsEditMode(true);
    onOpen();
  };

  const handleDelete = async () => {
    try {
      await companyService.deleteCompany(selectedCompany.id);
      toast({
        title: 'Uğurlu!',
        description: 'Şirkət uğurla silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      loadCompanies();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Şirkət silinərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Tarix dəyişdirmə funksiyası
  const handleDateChange = async () => {
    if (!selectedDateCompany || !newDate) return;

    try {
      await companyService.updateLastCheckDate(selectedDateCompany.id, newDate);
      toast({
        title: 'Uğurlu!',
        description: 'Son yoxlanış tarixi uğurla yeniləndi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDateClose();
      setNewDate('');
      setSelectedDateCompany(null);
      loadCompanies();
    } catch (error) {
      toast({
        title: 'Xəta!',
        description: 'Tarix yenilənərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Tarix dəyişdirmə modalını açmaq
  const openDateModal = (company) => {
    setSelectedDateCompany(company);
    setNewDate(company.lastCheckDate ? formatDateForInput(company.lastCheckDate) : '');
    onDateOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      taxNumber: '',
      accountant: '',
      asanId: '',
      pins: '',
      statisticalCode: '',
      column2: '',
      taxType: '',
      lastCheckDate: '',
      status: '',
      complianceDate: '',
      notes: '',
      bank: '',
      column1: '',
      bankCurator: '',
      otherNumbers: '',
      cashStatus: '',
      ygbStatus: '',
      certificateDate: '',
      notes2: '',
      activityCodes: ''
    });
    setSelectedCompany(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    onOpen();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await companyService.importCompanies(file);

      // Detailed success message
      const successMessage = `Import tamamlandı!\n\n` +
        `📊 Sheet: ${result.sheetName}\n` +
        `📝 Cəmi sətir: ${result.totalRows}\n` +
        `✅ Yaradıldı: ${result.createdCount}\n` +
        `🔄 Yeniləndi: ${result.updatedCount}\n` +
        `⏭️ Skip edildi: ${result.skippedRows || 0}\n` +
        `📈 Ümumi işlənən: ${result.getTotalProcessed ? result.getTotalProcessed() : (result.createdCount + result.updatedCount)}`;

      toast({
        title: 'Import Uğurlu!',
        description: successMessage,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });

      // Error handling
      if (result.errors && result.errors.length > 0) {
        console.warn('Import xətaları:', result.errors);

        // Show error summary
        toast({
          title: '⚠️ Import Xətaları',
          description: `${result.errors.length} sətirdə xəta var. Console-da ətraflı baxın.`,
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });

        // Log detailed errors
        console.group('Excel Import Xətaları');
        result.errors.forEach((error, index) => {
          console.error(`Xəta ${index + 1}:`, error);
        });
        console.groupEnd();
      }

      loadCompanies();
    } catch (error) {
      console.error('Import xətası:', error);
      toast({
        title: '❌ Import Xətası!',
        description: error.response?.data?.message || 'Excel faylı import edilərkən xəta baş verdi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      e.target.value = '';
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const isOk = status.toLowerCase().includes('ok');
    return (
      <Badge colorScheme={ isOk ? 'green' : 'red' } size="sm">
        { status }
      </Badge>
    );
  };

  const getTaxTypeBadge = (taxType) => {
    if (!taxType) return null;
    const isVAT = taxType.toLowerCase().includes('ədv');
    return (
      <Badge colorScheme={ isVAT ? 'blue' : 'orange' } size="sm">
        { taxType }
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Tarixin etibarlı olub-olmadığını yoxla
      if (isNaN(date.getTime())) {
        return '-';
      }
      // Azerbaycan dilində tarix formatı
      return date.toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.warn('Tarix format edilə bilmədi:', dateString, error);
      return '-';
    }
  };

  // Input üçün tarix formatı (yyyy-MM-dd)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0]; // yyyy-MM-dd formatı
    } catch (error) {
      console.warn('Input tarix format edilə bilmədi:', dateString, error);
      return '';
    }
  };

  // Mətin tarixini input üçün uyğun formata çevir (dd/MM/yyyy -> yyyy-MM-dd)
  const normalizeDateString = (value) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // artıq uyğundur
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch (_) { }
    return '';
  };

  // Şirkətləri son yoxlanış tarixinə görə sıralama
  const sortCompaniesByLastCheckDate = (companiesList) => {
    return [...companiesList].sort((a, b) => {
      // Əvvəlcə tarixi olmayanları göstər (həmişə yuxarıda)
      if (!a.lastCheckDate && !b.lastCheckDate) return 0;
      if (!a.lastCheckDate) return -1;
      if (!b.lastCheckDate) return 1;

      // Sonra tarixə görə sırala
      const dateA = new Date(a.lastCheckDate);
      const dateB = new Date(b.lastCheckDate);

      if (sortByLastCheckDate) {
        return dateA - dateB; // Ən köhnədən ən yeniyə
      } else {
        return dateB - dateA; // Ən yenidən ən köhnəyə
      }
    });
  };

  // Sıralama statusunu göstərən funksiya
  const getSortStatusText = () => {
    const noDateCount = companies.filter(c => !c.lastCheckDate).length;
    const withDateCount = companies.filter(c => c.lastCheckDate).length;

    return {
      noDateCount,
      withDateCount,
      sortDirection: sortByLastCheckDate ? "Ən köhnədən ən yeniyə" : "Ən yenidən ən köhnəyə"
    };
  };

  // Checkbox funksiyaları
  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCompanies([]);
      setSelectAll(false);
    } else {
      const allCompanyIds = sortCompaniesByLastCheckDate(companies).map(c => c.id);
      setSelectedCompanies(allCompanyIds);
      setSelectAll(true);
    }
  };

  const handleSelectAllWithoutDate = () => {
    const companiesWithoutDate = sortCompaniesByLastCheckDate(companies)
      .filter(c => !c.lastCheckDate)
      .map(c => c.id);
    setSelectedCompanies(companiesWithoutDate);
    setSelectAll(false);
  };

  const handleClearSelection = () => {
    setSelectedCompanies([]);
    setSelectAll(false);
  };

  // Bulk task form funksiyaları
  const handleBulkTaskFormChange = (e) => {
    const { name, value } = e.target;
    setBulkTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkTaskSubmit = async (e) => {
    e.preventDefault();

    if (selectedCompanies.length === 0) {
      toast({
        title: 'Xəta!',
        description: 'Heç bir şirkət seçilməyib',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!bulkTaskForm.categoryId) {
      toast({
        title: 'Xəta!',
        description: 'Tapşırıq kateqoriyası seçilməlidir',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const request = {
        companyIds: selectedCompanies,
        categoryId: parseInt(bulkTaskForm.categoryId),
        assignedUsername: bulkTaskForm.assignedUsername || null,
        title: bulkTaskForm.title || null,
        description: bulkTaskForm.description || null,
        delayMinutes: bulkTaskForm.delayMinutes ? parseInt(bulkTaskForm.delayMinutes) : null,
        delayHours: bulkTaskForm.delayHours ? parseInt(bulkTaskForm.delayHours) : null,
        delayDays: bulkTaskForm.delayDays ? parseInt(bulkTaskForm.delayDays) : null,
        delayWeeks: bulkTaskForm.delayWeeks ? parseInt(bulkTaskForm.delayWeeks) : null,
        executionDate: bulkTaskForm.executionDate || null
      };

      const response = await scheduledTaskService.assignBulkTasks(request);

      toast({
        title: 'Uğurlu!',
        description: response.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onBulkTaskClose();
      handleClearSelection();
      setBulkTaskForm({
        categoryId: '',
        assignedUsername: '',
        title: '',
        description: '',
        delayMinutes: '',
        delayHours: '',
        delayDays: '',
        delayWeeks: '',
        executionDate: ''
      });

    } catch (error) {
      toast({
        title: 'Xəta!',
        description: error.response?.data?.message || 'Tapşırıq təyin edilərkən xəta baş verdi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={ 8 }>
        <VStack spacing={ 6 } align="stretch">
          <HStack justify="space-between" align="center" spacing={ 4 }>
            <Heading size="lg" color="gray.700">
              Şirkətlər
            </Heading>
            <HStack spacing={ 3 }>
              <form onSubmit={ handleSearch }>
                <HStack>
                  <Input
                    placeholder="VÖEN üzrə axtarış"
                    value={ voenFilter }
                    onChange={ (e) => setVoenFilter(e.target.value) }
                    width={ { base: '180px', md: '240px' } }
                  />
                  <Button type="submit" colorScheme="blue" variant="solid">
                    Axtar
                  </Button>
                  <Button onClick={ clearSearch } variant="ghost">
                    Təmizlə
                  </Button>
                </HStack>
              </form>
              <Button
                leftIcon={ <FaFileImport /> }
                variant="outline"
                onClick={ handleImportClick }
              >
                Excel-dən Import
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={ fileInputRef }
                style={ { display: 'none' } }
                onChange={ handleFileChange }
              />
              <Button
                leftIcon={ <FaPlus /> }
                colorScheme="blue"
                onClick={ openCreateModal }
              >
                Yeni Şirkət
              </Button>
            </HStack>
          </HStack>

          {/* Seçim düymələri */ }
          { selectedCompanies.length > 0 && (
            <HStack spacing={ 3 } justify="center" bg="blue.50" p={ 3 } borderRadius="md">
              <Text fontWeight="medium" color="blue.700">
                { selectedCompanies.length } şirkət seçildi
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={ handleSelectAllWithoutDate }
              >
                Yoxlanış Tarixi Olmayanları Seç
              </Button>
              <Button
                size="sm"
                colorScheme="gray"
                variant="outline"
                onClick={ handleClearSelection }
              >
                Seçimi Təmizlə
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                onClick={ onBulkTaskOpen }
              >
                Seçilmiş Şirkətlərə Tapşırıq Təyin Et
              </Button>
            </HStack>
          ) }

          {/* Row Count Statistics */ }
          <HStack spacing={ 6 } justify="center">
            <Stat textAlign="center">
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                Ümumi Şirkətlər
              </StatLabel>
              <StatNumber fontSize="3xl" color="blue.500">
                { companies.length }
              </StatNumber>
              <StatHelpText>
                <FaUsers color="blue.500" style={ { display: 'inline', marginRight: '8px' } } />
                Sistemdə qeydiyyatda olan
              </StatHelpText>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                Sıralama
              </StatLabel>
              <StatNumber fontSize="lg" color="green.500">
                { getSortStatusText().sortDirection }
              </StatNumber>
              <StatHelpText>
                Son yoxlanış tarixinə görə
              </StatHelpText>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                Yoxlanış Tarixi Olmayan
              </StatLabel>
              <StatNumber fontSize="lg" color="red.500">
                { getSortStatusText().noDateCount }
              </StatNumber>
              <StatHelpText>
                Qırmızı ilə işarələnib
              </StatHelpText>
            </Stat>
            <Stat textAlign="center">
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                Yoxlanış Tarixi Olan
              </StatLabel>
              <StatNumber fontSize="lg" color="blue.500">
                { getSortStatusText().withDateCount }
              </StatNumber>
              <StatHelpText>
                Normal rəngdə
              </StatHelpText>
            </Stat>
          </HStack>

          {/* Geniş cədvəl - bütün Excel sütunları */ }
          <Box bg="white" borderRadius="lg" shadow="sm" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="50px" textAlign="center">
                    <Checkbox
                      isChecked={ selectAll }
                      onChange={ handleSelectAll }
                      colorScheme="blue"
                      size="sm"
                      title="Hamısını seç"
                    />
                  </Th>
                  <Th width="50px" textAlign="center">№</Th>
                  <Th>Şirkət Adı</Th>
                  <Th>VOEN</Th>
                  <Th>Mühasib</Th>
                  <Th>ASAN/ID</Th>
                  <Th>PİNLƏR</Th>
                  <Th>Statistika Kodu</Th>
                  <Th>Sadə/ƏDV</Th>
                  <Th>
                    <HStack spacing={ 1 }>
                      <Text>Son Yoxlanış</Text>
                      <IconButton
                        size="xs"
                        icon={ <FaSort /> }
                        onClick={ () => setSortByLastCheckDate(!sortByLastCheckDate) }
                        variant="ghost"
                        colorScheme="blue"
                        aria-label="Son yoxlanış tarixinə görə sırala"
                        title={ `Sıralama: ${sortByLastCheckDate ? "Ən köhnədən ən yeniyə" : "Ən yenidən ən köhnəyə"} (Tarixi olmayanlar həmişə yuxarıda)` }
                        _hover={ {
                          bg: 'blue.50',
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s'
                        } }
                      />
                    </HStack>
                  </Th>
                  <Th>Status</Th>
                  <Th>Uyğunsuzluq</Th>
                  <Th>Qeyd</Th>
                  <Th>Bank</Th>
                  <Th>Bank Kuratoru</Th>
                  <Th>Digər Nömrələr</Th>
                  <Th>Kassa</Th>
                  <Th>YGB</Th>
                  <Th>Sertifikat</Th>
                  <Th>Qeyd2</Th>
                  <Th>Fəaliyyət Kodları</Th>
                  <Th>Tapşırıqlar</Th>
                  <Th>Əməliyyatlar</Th>
                </Tr>
              </Thead>
              { isLoading ? <VStack colorPalette="teal">
                <Spinner color="colorPalette.600" />
                <Text color="red.500">Loading...</Text>
              </VStack> :
                <Tbody>
                  { sortCompaniesByLastCheckDate(companies).map((company, index) => (
                    <Tr key={ company.id } bg={ !company.lastCheckDate ? "red.50" : "transparent" }>
                      <Td textAlign="center">
                        <Checkbox
                          isChecked={ selectedCompanies.includes(company.id) }
                          onChange={ () => handleSelectCompany(company.id) }
                          colorScheme="blue"
                          size="sm"
                        />
                      </Td>
                      <Td textAlign="center" fontWeight="bold" bg={ !company.lastCheckDate ? "red.100" : "gray.50" }>
                        <Tooltip
                          label={ !company.lastCheckDate ? "Yoxlanış tarixi təyin edilməyib - prioritet" : `Sıra: ${index + 1}` }
                          hasArrow
                        >
                          <Text color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                            { index + 1 }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td fontWeight="medium" maxW="150px">
                        <Tooltip
                          label={ !company.lastCheckDate ? `${company.name} - Yoxlanış tarixi təyin edilməyib` : company.name }
                          hasArrow
                        >
                          <Text
                            noOfLines={ 2 }
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                            fontWeight={ !company.lastCheckDate ? "bold" : "medium" }
                          >
                            { company.name }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.taxNumber || '-' }
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.accountant || '-' }
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.asanId } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.asanId || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.pins || '-' }
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.statisticalCode || '-' }
                      </Td>
                      <Td>
                        <Box color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                          { getTaxTypeBadge(company.taxType) }
                        </Box>
                      </Td>
                      <Td>
                        <Button
                          variant={ company.lastCheckDate ? "ghost" : "solid" }
                          size="sm"
                          onClick={ () => openDateModal(company) }
                          colorScheme={ company.lastCheckDate ? "blue" : "red" }
                          _hover={ {
                            bg: company.lastCheckDate ? 'blue.50' : 'red.50',
                            transform: 'scale(1.05)',
                            transition: 'all 0.2s'
                          } }
                          title={ company.lastCheckDate ? "Son yoxlanış tarixini dəyiş" : "Yoxlanış tarixi təyin edilməyib - klikləyin" }
                        >
                          { formatDate(company.lastCheckDate) }
                        </Button>
                      </Td>
                      <Td>
                        <Box color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                          { getStatusBadge(company.status) }
                        </Box>
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.complianceDate } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.complianceDate || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="150px">
                        <Tooltip label={ company.notes } hasArrow>
                          <Text
                            noOfLines={ 2 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.notes || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.bank || '-' }
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.bankCurator } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.bankCurator || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.otherNumbers } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.otherNumbers || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={ company.cashStatus === 'Bəli' ? 'green' : 'gray' }
                          size="sm"
                          color={ !company.lastCheckDate ? "red.600" : "inherit" }
                        >
                          { company.cashStatus || '-' }
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={ company.ygbStatus === 'Bəli' ? 'green' : 'gray' }
                          size="sm"
                          color={ !company.lastCheckDate ? "red.600" : "inherit" }
                        >
                          { company.ygbStatus || '-' }
                        </Badge>
                      </Td>
                      <Td color={ !company.lastCheckDate ? "red.600" : "inherit" }>
                        { company.certificateDate || '-' }
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.notes2 } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.notes2 || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td maxW="120px">
                        <Tooltip label={ company.activityCodes } hasArrow>
                          <Text
                            noOfLines={ 1 }
                            fontSize="xs"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.activityCodes || '-' }
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <HStack spacing={ 1 }>
                          <ChakraBadge
                            colorScheme="blue"
                            size="sm"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.taskCount || 0 }
                          </ChakraBadge>
                          <ChakraBadge
                            colorScheme="yellow"
                            size="sm"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.activeTaskCount || 0 }
                          </ChakraBadge>
                          <ChakraBadge
                            colorScheme="green"
                            size="sm"
                            color={ !company.lastCheckDate ? "red.600" : "inherit" }
                          >
                            { company.completedTaskCount || 0 }
                          </ChakraBadge>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={ 1 }>
                          <IconButton
                            size="xs"
                            icon={ <FaEdit /> }
                            colorScheme="blue"
                            variant="ghost"
                            onClick={ () => handleEdit(company) }
                            aria-label="Redaktə et"
                          />
                          <IconButton
                            size="xs"
                            icon={ <FaTrash /> }
                            colorScheme="red"
                            variant="ghost"
                            onClick={ () => {
                              setSelectedCompany(company);
                              onDeleteOpen();
                            } }
                            aria-label="Sil"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  )) }
                </Tbody> }
            </Table>
          </Box>
        </VStack>

        {/* Create/Edit Modal */ }
        <Modal isOpen={ isOpen } onClose={ onClose } size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              { isEditMode ? 'Şirkəti Yenilə' : 'Yeni Şirkət' }
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={ 6 }>
              <form onSubmit={ handleSubmit }>
                <VStack spacing={ 4 }>
                  <FormControl isRequired>
                    <FormLabel>Şirkət Adı</FormLabel>
                    <Input
                      name="name"
                      value={ formData.name }
                      onChange={ handleInputChange }
                      placeholder="Şirkət adını daxil edin"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Vergi Nömrəsi</FormLabel>
                    <Input
                      name="taxNumber"
                      value={ formData.taxNumber }
                      onChange={ handleInputChange }
                      placeholder="Vergi nömrəsi"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Mühasib</FormLabel>
                    <Input
                      name="accountant"
                      value={ formData.accountant }
                      onChange={ handleInputChange }
                      placeholder="Mühasib adı"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>ASAN/ID</FormLabel>
                    <Input
                      name="asanId"
                      value={ formData.asanId }
                      onChange={ handleInputChange }
                      placeholder="ASAN identifikatoru"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>PİNLƏR</FormLabel>
                    <Input
                      name="pins"
                      value={ formData.pins }
                      onChange={ handleInputChange }
                      placeholder="PIN kodları"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Statistika Kodu</FormLabel>
                    <Input
                      name="statisticalCode"
                      value={ formData.statisticalCode }
                      onChange={ handleInputChange }
                      placeholder="Statistika kodu"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Sadə/ƏDV</FormLabel>
                    <Input
                      name="taxType"
                      value={ formData.taxType }
                      onChange={ handleInputChange }
                      placeholder="Sadə/ƏDV"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Son Yoxlanış Tarixi</FormLabel>
                    <Input
                      name="lastCheckDate"
                      type="date"
                      value={ formData.lastCheckDate }
                      onChange={ handleInputChange }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Input
                      name="status"
                      value={ formData.status }
                      onChange={ handleInputChange }
                      placeholder="OK/Not OK"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Qeyd</FormLabel>
                    <Textarea
                      name="notes"
                      value={ formData.notes }
                      onChange={ handleInputChange }
                      placeholder="Əlavə qeydlər"
                      rows={ 2 }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bank</FormLabel>
                    <Input
                      name="bank"
                      value={ formData.bank }
                      onChange={ handleInputChange }
                      placeholder="Bank adı"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bank Kuratoru</FormLabel>
                    <Input
                      name="bankCurator"
                      value={ formData.bankCurator }
                      onChange={ handleInputChange }
                      placeholder="Bank kuratoru"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Column2</FormLabel>
                    <Input
                      name="column2"
                      value={ formData.column2 }
                      onChange={ handleInputChange }
                      placeholder="Column2"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Column1</FormLabel>
                    <Input
                      name="column1"
                      value={ formData.column1 }
                      onChange={ handleInputChange }
                      placeholder="Column1"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Uyğunsuzluq Gəlmə Tarixi</FormLabel>
                    <Input
                      name="complianceDate"
                      value={ formData.complianceDate }
                      onChange={ handleInputChange }
                      placeholder="Tarix seçin"
                      type="date"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Digər Nömrələr</FormLabel>
                    <Input
                      name="otherNumbers"
                      value={ formData.otherNumbers }
                      onChange={ handleInputChange }
                      placeholder="Şirkətlə əlaqəli digər nömrələr"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Kassa (Bəli/Xeyr)</FormLabel>
                    <Input
                      name="cashStatus"
                      value={ formData.cashStatus }
                      onChange={ handleInputChange }
                      placeholder="Bəli/Xeyr"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>YGB (Bəli/Xeyr)</FormLabel>
                    <Input
                      name="ygbStatus"
                      value={ formData.ygbStatus }
                      onChange={ handleInputChange }
                      placeholder="Bəli/Xeyr"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>ASAN Nömrə Sertifikat</FormLabel>
                    <Input
                      name="certificateDate"
                      value={ formData.certificateDate }
                      onChange={ handleInputChange }
                      placeholder="Tarix seçin"
                      type="date"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Qeyd2</FormLabel>
                    <Textarea
                      name="notes2"
                      value={ formData.notes2 }
                      onChange={ handleInputChange }
                      placeholder="Əlavə qeyd"
                      rows={ 2 }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Fəaliyyət Kodları</FormLabel>
                    <Input
                      name="activityCodes"
                      value={ formData.activityCodes }
                      onChange={ handleInputChange }
                      placeholder="Fəaliyyət kodları"
                    />
                  </FormControl>

                  <HStack spacing={ 4 } width="full" justify="flex-end">
                    <Button onClick={ onClose }>Ləğv Et</Button>
                    <Button type="submit" colorScheme="blue">
                      { isEditMode ? 'Yenilə' : 'Yarat' }
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
                Şirkəti Sil
              </AlertDialogHeader>

              <AlertDialogBody>
                "{ selectedCompany?.name }" şirkətini silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
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

        {/* Tarix Dəyişdirmə Modalı */ }
        <Modal isOpen={ isDateOpen } onClose={ onDateClose } size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Son Yoxlanış Tarixini Dəyişdir
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={ 4 }>
                <Text>
                  <strong>{ selectedDateCompany?.name }</strong> şirkəti üçün son yoxlanış tarixini dəyişdirin:
                </Text>

                <FormControl>
                  <FormLabel>Yeni Tarix</FormLabel>
                  <Input
                    type="date"
                    value={ newDate }
                    onChange={ (e) => setNewDate(e.target.value) }
                    placeholder="Tarix seçin"
                  />
                </FormControl>

                <HStack spacing={ 4 } width="full" justify="flex-end">
                  <Button onClick={ onDateClose }>Ləğv Et</Button>
                  <Button
                    colorScheme="blue"
                    onClick={ handleDateChange }
                    isDisabled={ !newDate }
                  >
                    Yenilə
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Bulk Task Assignment Modal */ }
        <Modal isOpen={ isBulkTaskOpen } onClose={ onBulkTaskClose } size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Çoxlu Şirkətlərə Tapşırıq Təyin Et
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={ handleBulkTaskSubmit }>
                <VStack spacing={ 4 }>
                  <Box bg="blue.50" p={ 3 } borderRadius="md" width="full">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={ 1 }>
                        <Text fontWeight="medium" color="blue.700">
                          { selectedCompanies.length } şirkət seçildi
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          Seçilmiş şirkətlərə vaxtlı tapşırıq təyin ediləcək
                        </Text>
                      </VStack>
                      <Badge colorScheme="blue" fontSize="sm">
                        { selectedCompanies.length } şirkət
                      </Badge>
                    </HStack>
                  </Box>

                  <FormControl isRequired>
                    <FormLabel>Tapşırıq Kateqoriyası</FormLabel>
                    <select
                      name="categoryId"
                      value={ bulkTaskForm.categoryId }
                      onChange={ handleBulkTaskFormChange }
                      style={ {
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      } }
                    >
                      <option value="">Kateqoriya seçin</option>
                      { categories.map(category => (
                        <option key={ category.id } value={ category.id }>
                          { category.name }
                        </option>
                      )) }
                    </select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>İstifadəçi (İsteğe bağlı)</FormLabel>
                    <select
                      name="assignedUsername"
                      value={ bulkTaskForm.assignedUsername }
                      onChange={ handleBulkTaskFormChange }
                      style={ {
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      } }
                    >
                      <option value="">İstifadəçi seçin</option>
                      { users.map(user => (
                        <option key={ user.username } value={ user.username }>
                          { user.username } ({ user.email })
                        </option>
                      )) }
                    </select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tapşırıq Başlığı (İsteğe bağlı)</FormLabel>
                    <Input
                      name="title"
                      value={ bulkTaskForm.title }
                      onChange={ handleBulkTaskFormChange }
                      placeholder="Tapşırıq başlığı"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Təsvir (İsteğe bağlı)</FormLabel>
                    <Textarea
                      name="description"
                      value={ bulkTaskForm.description }
                      onChange={ handleBulkTaskFormChange }
                      placeholder="Tapşırıq təsviri"
                      rows={ 2 }
                    />
                  </FormControl>

                  <Box width="full">
                    <Text fontWeight="medium" mb={ 3 }>Vaxt Təyin Etmə</Text>

                    {/* Vaxt rejimi seçimi */ }
                    <HStack spacing={ 4 } mb={ 4 }>
                      <Button
                        size="sm"
                        variant={ timeMode === 'delay' ? 'solid' : 'outline' }
                        colorScheme="blue"
                        onClick={ () => setTimeMode('delay') }
                      >
                        Gecikmə Vaxtı
                      </Button>
                      <Button
                        size="sm"
                        variant={ timeMode === 'exact' ? 'solid' : 'outline' }
                        colorScheme="blue"
                        onClick={ () => setTimeMode('exact') }
                      >
                        Dəqiq Tarix
                      </Button>
                    </HStack>

                    { timeMode === 'delay' ? (
                      <VStack spacing={ 3 }>
                        <Text fontSize="sm" color="gray.600" alignSelf="flex-start">
                          Tapşırıq neçə vaxt sonra icra edilsin?
                        </Text>
                        <HStack spacing={ 3 } width="full">
                          <FormControl>
                            <FormLabel>Həftə</FormLabel>
                            <Input
                              name="delayWeeks"
                              value={ bulkTaskForm.delayWeeks }
                              onChange={ handleBulkTaskFormChange }
                              placeholder="0"
                              type="number"
                              min="0"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Gün</FormLabel>
                            <Input
                              name="delayDays"
                              value={ bulkTaskForm.delayDays }
                              onChange={ handleBulkTaskFormChange }
                              placeholder="0"
                              type="number"
                              min="0"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Saat</FormLabel>
                            <Input
                              name="delayHours"
                              value={ bulkTaskForm.delayHours }
                              onChange={ handleBulkTaskFormChange }
                              placeholder="0"
                              type="number"
                              min="0"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Dəqiqə</FormLabel>
                            <Input
                              name="delayMinutes"
                              value={ bulkTaskForm.delayMinutes }
                              onChange={ handleBulkTaskFormChange }
                              placeholder="0"
                              type="number"
                              min="0"
                            />
                          </FormControl>
                        </HStack>

                        {/* Nümunə vaxtlar */ }
                        <Box bg="gray.50" p={ 3 } borderRadius="md" width="full">
                          <Text fontSize="sm" fontWeight="medium" mb={ 2 }>Nümunə vaxtlar:</Text>
                          <HStack spacing={ 2 } flexWrap="wrap">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  delayMinutes: '10',
                                  delayHours: '',
                                  delayDays: '',
                                  delayWeeks: ''
                                }));
                              } }
                            >
                              10 dəqiqə
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  delayHours: '2',
                                  delayMinutes: '',
                                  delayDays: '',
                                  delayWeeks: ''
                                }));
                              } }
                            >
                              2 saat
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  delayDays: '1',
                                  delayMinutes: '',
                                  delayHours: '',
                                  delayWeeks: ''
                                }));
                              } }
                            >
                              1 gün
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  delayWeeks: '1',
                                  delayMinutes: '',
                                  delayHours: '',
                                  delayDays: ''
                                }));
                              } }
                            >
                              1 həftə
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    ) : (
                      <VStack spacing={ 3 }>
                        <Text fontSize="sm" color="gray.600" alignSelf="flex-start">
                          Tapşırıq dəqiq hansı vaxtda icra edilsin?
                        </Text>
                        <FormControl>
                          <FormLabel>İcra Tarixi və Vaxtı</FormLabel>
                          <Input
                            name="executionDate"
                            value={ bulkTaskForm.executionDate }
                            onChange={ handleBulkTaskFormChange }
                            type="datetime-local"
                            placeholder="yyyy-MM-dd HH:mm"
                          />
                        </FormControl>

                        {/* Nümunə tarixlər */ }
                        <Box bg="gray.50" p={ 3 } borderRadius="md" width="full">
                          <Text fontSize="sm" fontWeight="medium" mb={ 2 }>Nümunə tarixlər:</Text>
                          <HStack spacing={ 2 } flexWrap="wrap">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(9, 0, 0, 0);
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  executionDate: tomorrow.toISOString().slice(0, 16)
                                }));
                              } }
                            >
                              Sabah 09:00
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={ () => {
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                nextWeek.setHours(14, 30, 0, 0);
                                setBulkTaskForm(prev => ({
                                  ...prev,
                                  executionDate: nextWeek.toISOString().slice(0, 16)
                                }));
                              } }
                            >
                              Növbəti həftə 14:30
                            </Button>
                          </HStack>
                        </Box>
                      </VStack>
                    ) }
                  </Box>

                  <HStack spacing={ 4 } width="full" justify="flex-end">
                    <Button onClick={ onBulkTaskClose } variant="outline">
                      Ləğv Et
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="green"
                      leftIcon={ <FaPlus /> }
                      isDisabled={ selectedCompanies.length === 0 || !bulkTaskForm.categoryId }
                      isLoading={ loading }
                    >
                      { selectedCompanies.length } Şirkətə Tapşırıq Təyin Et
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default CompaniesPage;
