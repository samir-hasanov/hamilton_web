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
  StatArrow,
} from '@chakra-ui/react';
import { 
  FaUsers, 
  FaChartLine, 
  FaCog, 
  FaBell,
  FaPlus,
  FaBuilding,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import Layout from '../layout/Layout';
import authService from '../api_services/authService';
import taskService from '../api_services/taskService';
import companyService from '../api_services/companyService';
import notificationService from '../api_services/notificationService';
import { useNavigate } from 'react-router-dom';
import reportService from '../api_services/reportService';
import CurrencyConverter from '../components/CurrencyConverter';
import { userDisplayName } from '../utils/userDisplayName';
import HoverPreviewAvatar from '../components/HoverPreviewAvatar';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [welcomeAvatarUrl, setWelcomeAvatarUrl] = useState(null);
  // Performance charts state
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalCompanies: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [unreadIds, setUnreadIds] = useState(() => {
    try {
      const raw = localStorage.getItem('overdueUnreadIds');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [serverNotifications, setServerNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Load performance data for charts
    reportService.getUserPerformance().then(setPerformanceData).catch(() => {});
    // İlk yükləmədə və hər 60 saniyədə bir gecikmiş tapşırıqları yoxla
    fetchOverdue();
    fetchUnreadCount();
    fetchNotifications();
    const id = setInterval(fetchOverdue, 60000);
    const nid = setInterval(() => { fetchUnreadCount(); fetchNotifications(); }, 60000);
    return () => { clearInterval(id); clearInterval(nid); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authService.getMe();
        if (cancelled) return;
        setUser(authService.getCurrentUser());
      } catch {
        if (!cancelled) setUser(authService.getCurrentUser());
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const loadDashboardData = async () => {
    try {
      const [tasks, companies] = await Promise.all([
        taskService.getAllTasks(),
        companyService.getAllCompanies()
      ]);

      const pendingTasks = tasks.filter(task => task.status === 'PENDING');
      const activeTasks = tasks.filter(task => task.status === 'ACTIVE');
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
      setStats(prev => ({
        ...prev,
        totalTasks: tasks.length,
        pendingTasks: pendingTasks.length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        totalCompanies: companies.length
      }));

      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    }
  };

  const fetchOverdue = async () => {
    try {
      const list = await taskService.getOverdueTasks();
      setOverdueList(list);
      // Cari overdue siyahısına əsasən unread siyahısını sinxron et
      const incomingIds = list.map(t => t.id).filter(Boolean);
      const incomingSet = new Set(incomingIds);
      // 1) Artıq overdue olmayanları çıxart
      let updated = unreadIds.filter(id => incomingSet.has(id));
      const updatedSet = new Set(updated);
      // 2) Yeni gələnləri əlavə et
      incomingIds.forEach(id => { if (!updatedSet.has(id)) updated.push(id); });
      if (JSON.stringify(updated) !== JSON.stringify(unreadIds)) {
        setUnreadIds(updated);
        localStorage.setItem('overdueUnreadIds', JSON.stringify(updated));
      }
      // Statistikada göstər
      setStats(prev => ({ ...prev, overdueTasks: list.length }));
    } catch (e) {
      console.error('Overdue fetch error:', e);
    }
  };

  const markAllRead = async () => {
    setMarkingAllRead(true);
    setUnreadIds([]);
    localStorage.setItem('overdueUnreadIds', JSON.stringify([]));
    try {
      // serverdə oxundu işarələ
      await notificationService.markAllRead();
      setUnreadCount(0);
      // UI-da dərhal yenilə ki istifadəçi nəticəni görsün
      setServerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetchNotifications();
    } catch (_) {
      // ignore
    } finally {
      setMarkingAllRead(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(Number(count || 0));
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setServerNotifications(list);
    } catch (_) {}
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
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center">
              <HStack align="center" spacing={4}>
                <HoverPreviewAvatar
                  size="lg"
                  src={welcomeAvatarUrl || undefined}
                  name={userDisplayName(user)}
                  onError={() => {
                    setWelcomeAvatarUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                  }}
                />
                <VStack align="start" spacing={2}>
                  <Heading size="lg" color="gray.700">
                    Xoş gəlmisiniz, {userDisplayName(user)}!
                  </Heading>
                  <Text color="gray.500">
                    Hamilton sisteminin idarəetmə paneli · {user.username}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <CurrencyConverter />
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => { setIsNotifOpen(true); }}
                >
                  <HStack>
                    <Box position="relative">
                      <Icon as={FaBell} />
                      {(unreadCount > 0) && (
                        <Badge position="absolute" top="-1" right="-2" borderRadius="full" colorScheme="red" fontSize="0.6em" px={1.5}>
                          {unreadCount}
                        </Badge>
                      )}
                    </Box>
                    <Text>Bildirişlər</Text>
                  </HStack>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  colorScheme="red"
                >
                  Çıxış
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Ümumi Tapşırıqlar
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">{stats.totalTasks}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaTasks} color="blue.500" mr={2} />
                    Bütün tapşırıqlar
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
                  <StatNumber fontSize="2xl" color="gray.500">{stats.pendingTasks}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaClock} color="gray.500" mr={2} />
                    Başlanılmayan
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Aktiv Tapşırıqlar
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.500">{stats.activeTasks}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaClock} color="yellow.500" mr={2} />
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
                  <StatNumber fontSize="2xl" color="green.500">{stats.completedTasks}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaCheckCircle} color="green.500" mr={2} />
                    Uğurla tamamlanmış
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    Gecikmiş
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="red.500">{stats.overdueTasks}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaExclamationTriangle} color="red.500" mr={2} />
                    Vaxtı keçmiş
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card bg="white" border="1px" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="gray.700">
                  Qrafik Görünüş
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {performanceData.length > 0 ? (
                    performanceData.map((row) => (
                      <Box key={row.username} p={4} bg="gray.50" borderRadius="md">
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
                          {/* Inline small donut */}
                          <Box position="relative" width="120px" height="120px">
                            {/* background circle */}
                            <svg width={120} height={120} viewBox="0 0 120 120">
                              <circle cx={60} cy={60} r={52} fill="none" stroke="#EDF2F7" strokeWidth={16} />
                              {/* completed */}
                              {(() => {
                                const total = Math.max(1, (row.completedTasks||0)+(row.activeTasks||0)+(row.overdueTasks||0));
                                const radius = 52;
                                const circumference = 2 * Math.PI * radius;
                                let offset = 0;
                                const segs = [
                                  {value: row.completedTasks, color: '#38A169'},
                                  {value: row.activeTasks, color: '#D69E2E'},
                                  {value: row.overdueTasks, color: '#E53E3E'}
                                ];
                                return segs.map((seg, i) => {
                                  const length = (seg.value/total)*circumference;
                                  const el = (
                                    <circle key={i} cx={60} cy={60} r={52} fill="none" stroke={seg.color} strokeWidth={16}
                                      strokeDasharray={`${length} ${circumference-length}`}
                                      strokeDashoffset={-offset}
                                      transform={`rotate(-90 60 60)`}
                                    />
                                  );
                                  offset += length;
                                  return el;
                                });
                              })()}
                            </svg>
                            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
                              <Text fontSize="lg" fontWeight="bold">
                                {Math.round(((row.completedTasks||0)/Math.max(1,(row.completedTasks||0)+(row.activeTasks||0)+(row.overdueTasks||0)))*100)}%
                              </Text>
                              <Text fontSize="xs" color="gray.500">tamamlanma</Text>
                            </Box>
                          </Box>
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500" textAlign="center">Məlumat yoxdur</Text>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Card bg="white" border="1px" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="gray.700">
                  Sürətli Əməliyyatlar
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate('/tasks')}
                  >
                    Yeni Tapşırıq Yarat
                  </Button>
                  <Button
                    leftIcon={<FaBuilding />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => navigate('/companies')}
                  >
                    Şirkətləri İdarə Et
                  </Button>
                  <Button
                    leftIcon={<FaTasks />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => navigate('/my-tasks')}
                  >
                    Mənim Tapşırıqlarım
                  </Button>
                  <Button
                    leftIcon={<FaChartLine />}
                    colorScheme="orange"
                    variant="outline"
                    onClick={() => navigate('/reports')}
                  >
                    Hesabatları Görüntülə
                  </Button>
                  <Button
                    leftIcon={<FaUsers />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => navigate('/users')}
                  >
                    İşçiləri İdarə Et
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>

      {isNotifOpen && (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="blackAlpha.400" zIndex={1000}
             onClick={() => setIsNotifOpen(false)}>
          <Box bg="white" borderRadius="md" boxShadow="xl" p={6} maxW="600px" mx="auto" mt={24}
               onClick={(e) => e.stopPropagation()}>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Gecikmiş Tapşırıqlar</Heading>
              <Button size="sm" onClick={() => setIsNotifOpen(false)}>Bağla</Button>
            </HStack>
            <VStack align="stretch" spacing={3} maxH="60vh" overflowY="auto">
              {serverNotifications.length > 0 ? (
                serverNotifications.map(n => (
                  <Box key={n.id} p={4} borderWidth="1px" borderRadius="md" bg={n.read ? 'gray.50' : 'orange.50'}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="medium">{n.title}</Text>
                      {!n.read && (<Badge colorScheme="red">Yeni</Badge>)}
                    </HStack>
                    <Text fontSize="sm" color="gray.700">{n.message}</Text>
                    <Text fontSize="xs" color="gray.500">{new Date(n.createdAt).toLocaleString('az-AZ')}</Text>
                  </Box>
                ))
              ) : (
                overdueList.length === 0 ? (
                  <Text color="gray.500">Gecikmiş tapşırıq yoxdur.</Text>
                ) : (
                  overdueList.map(t => (
                    <Box key={t.id || `${t.company}-${t.assignedUser}-${t.dueDate}`}
                         p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="medium">{t.title || 'Tapşırıq'}</Text>
                        <Badge colorScheme={'orange'}>Vaxtı keçib</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        Şirkət: {t.company} • İcraçı: {t.assignedUser || '—'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">Son tarix: {t.dueDate ? new Date(t.dueDate).toLocaleString('az-AZ') : '-'}</Text>
                    </Box>
                  ))
                )
              )}
            </VStack>
            {(serverNotifications.length > 0 || overdueList.length > 0) && (
              <HStack justify="flex-end" mt={4}>
                <Button size="sm" variant="outline" onClick={markAllRead} isLoading={markingAllRead}>
                  Hamısını oxundu işarələ
                </Button>
              </HStack>
            )}
          </Box>
        </Box>
      )}
    </Layout>
  );
};

export default DashboardPage;
