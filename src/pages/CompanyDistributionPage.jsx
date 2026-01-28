import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Heading, Input, Select, Spinner, Stack, Switch, Table, Tbody, Td, Th, Thead, Tr, Text } from '@chakra-ui/react';
import companyService from '../api_services/companyService';
import authService from '../api_services/authService';
import { Navigate, useNavigate } from 'react-router-dom';


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
    return companies.filter(c => {
      const matchText = [c.name, c.taxNumber, c.accountant].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
      const matchWorker = workerFilter === 'all' ? true : (c.assignedUsername || '') === workerFilter;
      return matchText && matchWorker;
    });
  }, [companies, search, workerFilter]);

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
    <Box p={ 6 }>
      <Flex justify="space-between" align="center" mb={ 6 }>
        <Heading size="md">Şirkətlərin bölüşdürülməsi</Heading>
        <Box display="flex" gap="20px">
          <Button onClick={ handleGoBack } colorScheme="blue">Geri</Button>
          <Button onClick={ fetchAll } colorScheme="blue">Yenilə</Button>
        </Box>

      </Flex>

      <Stack direction={ { base: 'column', md: 'row' } } spacing={ 4 } mb={ 4 }>
        <Input placeholder="Ad/VOEN axtar" value={ search } onChange={ (e) => setSearch(e.target.value) } />
        <Select value={ workerFilter } onChange={ (e) => setWorkerFilter(e.target.value) }>
          <option value="all">Bütün işçilər</option>
          { users.map(u => (
            <option key={ u.username } value={ u.username }>{ u.username }</option>
          )) }
        </Select>
      </Stack>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Ad</Th>
            <Th>VOEN</Th>
            <Th>Hazırki işçi</Th>
            <Th>Yeni işçi</Th>
            <Th isNumeric>Əməliyyatlar</Th>
            <Th>Ümumi (public)</Th>
          </Tr>
        </Thead>
        <Tbody>
          { filteredCompanies.map(c => (
            <Tr key={ c.id }>
              <Td>
                <Stack spacing={ 0 }>
                  <Text fontWeight="semibold">{ c.name }</Text>
                  <Text fontSize="xs" color="gray.500">{ c.status || '-' } | Son yoxlanış: { c.lastCheckDate ? new Date(c.lastCheckDate).toLocaleDateString() : '-' }</Text>
                </Stack>
              </Td>
              <Td>{ c.taxNumber || '-' }</Td>
              <Td>{ c.assignedUsername || '-' }</Td>
              <Td>
                <Select placeholder="İşçi seçin" size="sm" onChange={ (e) => handleAssign(c.id, e.target.value) } value="">
                  { users.map(u => (
                    <option key={ u.username } value={ u.username }>{ u.username }</option>
                  )) }
                </Select>
              </Td>
              <Td isNumeric>
                <Stack direction="row" justify="flex-end">
                  <Button size="sm" variant="outline" onClick={ () => handleUnassign(c.id) } disabled={ !c.assignedUsername }>Geri al</Button>
                </Stack>
              </Td>
              <Td>
                <Switch isChecked={ !!c.isPublic } onChange={ (e) => handlePublicToggle(c.id, e.target.checked) } />
              </Td>
            </Tr>
          )) }
        </Tbody>
      </Table>
    </Box>
  );
};

export default CompanyDistributionPage;


