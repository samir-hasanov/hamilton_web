import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react';
import companyService from '../api_services/companyService';
import authService from '../api_services/authService';
import { useNavigate } from 'react-router-dom';


const CompanyDistributionPage = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('all');
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allCompanies, allUsers] = await Promise.all([
        companyService.getAllCompanies(),
        authService.getUsersByRole('WORKER').catch(async () => authService.getAllUsers()),
      ]);
      setCompanies(allCompanies);
      setUsers(allUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = companies.filter(c => {
      const matchText = [c.name, c.taxNumber, c.accountant]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchWorker = workerFilter === 'all' ? true : (c.assignedUsername || '') === workerFilter;
      return matchText && matchWorker;
    });

    // Public companies should always stay at the top, then assigned ones.
    return filtered.sort((a, b) => {
      const aPublic = a.isPublic ? 1 : 0;
      const bPublic = b.isPublic ? 1 : 0;
      const aAssigned = a.assignedUsername ? 1 : 0;
      const bAssigned = b.assignedUsername ? 1 : 0;
      if (aPublic !== bPublic) return bPublic - aPublic;
      if (aAssigned !== bAssigned) return bAssigned - aAssigned;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [companies, search, workerFilter]);

  const stats = useMemo(() => {
    const total = companies.length;
    const assigned = companies.filter(c => !!c.assignedUsername).length;
    const unassigned = total - assigned;
    const publicCount = companies.filter(c => !!c.isPublic).length;
    return { total, assigned, unassigned, publicCount };
  }, [companies]);

  const handleAssign = async (companyId, username) => {
    await companyService.assignCompany(companyId, username);
    await fetchAll();
  };

  const handleUnassign = async (companyId) => {
    await companyService.unassignCompany(companyId);
    await fetchAll();
  };

  const handlePublicToggle = async (companyId, value) => {
    await companyService.setCompanyPublic(companyId, value);
    await fetchAll();
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" h="60vh">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1400px" mx="auto">
      <Stack spacing={6}>
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
          <Box>
            <Heading size="md">Şirkətlərin bölüşdürülməsi</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Public şirkətlər əvvəl, sonra təhkim olunanlar göstərilir.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button onClick={ handleGoBack } variant="outline" colorScheme="blue">Geri</Button>
            <Button onClick={ fetchAll } colorScheme="blue">Yenilə</Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <Box p={3} borderWidth="1px" borderRadius="lg" bg="white">
            <Text fontSize="xs" color="gray.500">Cəmi şirkət</Text>
            <Text fontSize="xl" fontWeight="bold">{stats.total}</Text>
          </Box>
          <Box p={3} borderWidth="1px" borderRadius="lg" bg="white">
            <Text fontSize="xs" color="gray.500">Təhkim olunub</Text>
            <Text fontSize="xl" fontWeight="bold" color="green.500">{stats.assigned}</Text>
          </Box>
          <Box p={3} borderWidth="1px" borderRadius="lg" bg="white">
            <Text fontSize="xs" color="gray.500">Boş şirkət</Text>
            <Text fontSize="xl" fontWeight="bold" color="orange.500">{stats.unassigned}</Text>
          </Box>
          <Box p={3} borderWidth="1px" borderRadius="lg" bg="white">
            <Text fontSize="xs" color="gray.500">Ümumi (public)</Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">{stats.publicCount}</Text>
          </Box>
        </SimpleGrid>

        <Box p={{ base: 3, md: 4 }} borderWidth="1px" borderRadius="lg" bg="white">
          <Stack direction={ { base: 'column', md: 'row' } } spacing={ 3 }>
            <Input
              placeholder="Ad/VOEN axtar"
              value={ search }
              onChange={ (e) => setSearch(e.target.value) }
              bg="gray.50"
            />
            <Select value={ workerFilter } onChange={ (e) => setWorkerFilter(e.target.value) } bg="gray.50">
              <option value="all">Bütün işçilər</option>
              { users.map(u => (
                <option key={ u.username } value={ u.username }>{ u.username }</option>
              )) }
            </Select>
          </Stack>
        </Box>

        <Box display={{ base: 'none', md: 'block' }} borderWidth="1px" borderRadius="lg" overflowX="auto" bg="white">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Şirkət</Th>
                <Th>VOEN</Th>
                <Th>Təhkim</Th>
                <Th>Yeni təhkim</Th>
                <Th>Public</Th>
                <Th isNumeric>Əməliyyat</Th>
              </Tr>
            </Thead>
            <Tbody>
              { filteredCompanies.map((c, idx) => (
                <Tr key={ c.id } bg={idx % 2 === 0 ? 'white' : 'gray.50'} _hover={{ bg: 'gray.100' }}>
                  <Td>
                    <Stack spacing={ 0.5 }>
                      <Text fontWeight="semibold">{ c.name }</Text>
                      <Text fontSize="xs" color="gray.500">
                        Son yoxlanış: { c.lastCheckDate ? new Date(c.lastCheckDate).toLocaleDateString() : '-' }
                      </Text>
                    </Stack>
                  </Td>
                  <Td>{ c.taxNumber || '-' }</Td>
                  <Td>
                    {c.assignedUsername ? <Badge colorScheme="green" borderRadius="md">{c.assignedUsername}</Badge> : <Badge colorScheme="gray" borderRadius="md">Boş</Badge>}
                  </Td>
                  <Td>
                    <Select placeholder="İşçi seçin" size="sm" onChange={ (e) => handleAssign(c.id, e.target.value) } value="">
                      { users.map(u => (
                        <option key={ u.username } value={ u.username }>{ u.username }</option>
                      )) }
                    </Select>
                  </Td>
                  <Td>
                    <Switch isChecked={ !!c.isPublic } onChange={ (e) => handlePublicToggle(c.id, e.target.checked) } />
                  </Td>
                  <Td isNumeric>
                    <Button size="sm" variant="ghost" colorScheme="red" onClick={ () => handleUnassign(c.id) } disabled={ !c.assignedUsername }>
                      Geri al
                    </Button>
                  </Td>
                </Tr>
              )) }
            </Tbody>
          </Table>
          {filteredCompanies.length === 0 && (
            <Box p={5}>
              <Text color="gray.500" textAlign="center">Filterə uyğun şirkət tapılmadı.</Text>
            </Box>
          )}
        </Box>

        <Stack spacing={3} display={{ base: 'flex', md: 'none' }}>
          {filteredCompanies.map(c => (
            <Box key={c.id} borderWidth="1px" borderRadius="lg" p={3} bg="white">
              <Flex justify="space-between" align="flex-start" gap={2}>
                <Stack spacing={0}>
                  <Text fontWeight="bold">{c.name}</Text>
                  <Text fontSize="xs" color="gray.500">VOEN: {c.taxNumber || '-'}</Text>
                </Stack>
                {c.isPublic ? <Badge colorScheme="blue">Public</Badge> : (c.assignedUsername ? <Badge colorScheme="green">Təhkimli</Badge> : <Badge colorScheme="gray">Boş</Badge>)}
              </Flex>
              <Divider my={3} />
              <Text fontSize="xs" color="gray.600" mb={1}>Hazırkı işçi</Text>
              <Text fontWeight="medium" mb={3}>{c.assignedUsername || '-'}</Text>
              <Select placeholder="İşçi seçin" size="sm" onChange={(e) => handleAssign(c.id, e.target.value)} value="">
                {users.map(u => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </Select>
              <HStack justify="space-between" mt={3}>
                <Button size="sm" variant="outline" onClick={() => handleUnassign(c.id)} disabled={!c.assignedUsername}>
                  Geri al
                </Button>
                <HStack>
                  <Text fontSize="xs" color="gray.600">Public</Text>
                  <Switch isChecked={!!c.isPublic} onChange={(e) => handlePublicToggle(c.id, e.target.checked)} />
                </HStack>
              </HStack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyDistributionPage;


