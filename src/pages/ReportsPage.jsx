import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Table, Thead, Tr, Th, Tbody, Td, Badge, VStack, HStack, Text } from '@chakra-ui/react';
import Layout from '../layout/Layout';
import reportService from '../api_services/reportService';

const DonutChart = ({ completed = 0, active = 0, overdue = 0, size = 120, strokeWidth = 16 }) => {
  const total = Math.max(1, (completed || 0) + (active || 0) + (overdue || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: completed, color: '#38A169' }, // green.500
    { value: active, color: '#D69E2E' },    // yellow.600
    { value: overdue, color: '#E53E3E' }    // red.600
  ];

  let offset = 0;
  const rings = segments.map((seg, idx) => {
    const length = (seg.value / total) * circumference;
    const el = (
      <circle
        key={idx}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="butt"
      />
    );
    offset += length;
    return el;
  });

  const completedPct = Math.round((completed / total) * 100);

  return (
    <Box position="relative" width={`${size}px`} height={`${size}px`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDF2F7"
          strokeWidth={strokeWidth}
        />
        {rings}
      </svg>
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
        <Text fontSize="lg" fontWeight="bold">{completedPct}%</Text>
        <Text fontSize="xs" color="gray.500">tamamlanma</Text>
      </Box>
    </Box>
  );
};

const ReportsPage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    reportService.getUserPerformance().then(setData).catch(console.error);
  }, []);

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={6}>İstifadəçi Performansı</Heading>

        <Box bg="white" borderWidth="1px" borderRadius="md" p={4} mb={8}>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>İstifadəçi</Th>
                <Th isNumeric>Tamamlanmış</Th>
                <Th isNumeric>Aktiv</Th>
                <Th isNumeric>Gecikmiş</Th>
                <Th isNumeric>Orta Tamamlama (gün)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr key={row.username}>
                  <Td>{row.username}</Td>
                  <Td isNumeric><Badge colorScheme="green">{row.completedTasks}</Badge></Td>
                  <Td isNumeric><Badge colorScheme="yellow">{row.activeTasks}</Badge></Td>
                  <Td isNumeric><Badge colorScheme="red">{row.overdueTasks}</Badge></Td>
                  <Td isNumeric>{row.averageCompletionTime?.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Heading size="md" mb={4}>Qrafik Görünüş</Heading>
        <VStack spacing={4} align="stretch">
          {data.map((row) => {
            return (
              <Box key={row.username} bg="white" borderWidth="1px" borderRadius="md" p={4}>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{row.username}</Text>
                    <HStack spacing={4}>
                      <HStack spacing={2}>
                        <Box boxSize="10px" bg="green.400" borderRadius="sm" />
                        <Text fontSize="sm">Tamamlanmış: <b>{row.completedTasks}</b></Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Box boxSize="10px" bg="yellow.500" borderRadius="sm" />
                        <Text fontSize="sm">Aktiv: <b>{row.activeTasks}</b></Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Box boxSize="10px" bg="red.500" borderRadius="sm" />
                        <Text fontSize="sm">Gecikmiş: <b>{row.overdueTasks}</b></Text>
                      </HStack>
                    </HStack>
                  </VStack>
                  <DonutChart
                    completed={row.completedTasks}
                    active={row.activeTasks}
                    overdue={row.overdueTasks}
                    size={120}
                    strokeWidth={16}
                  />
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Container>
    </Layout>
  );
};

export default ReportsPage;


