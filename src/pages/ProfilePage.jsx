import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import authService from '../api_services/authService';
import { userDisplayName } from '../utils/userDisplayName';
import HoverPreviewAvatar from '../components/HoverPreviewAvatar';

const ProfilePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const refreshAvatarPreview = async () => {
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    const u = authService.getCurrentUser();
    if (!u?.profileImagePresent) return;
    try {
      const url = await authService.fetchProfileAvatarObjectUrl();
      if (url) setAvatarUrl(url);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await authService.getMe();
        if (cancelled) return;
        const u = authService.getCurrentUser();
        setForm({
          displayName: u?.displayName || '',
          email: u?.email || '',
          phoneNumber: u?.phoneNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        if (u?.profileImagePresent) {
          try {
            const url = await authService.fetchProfileAvatarObjectUrl();
            if (!cancelled && url) setAvatarUrl(url);
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        if (!cancelled) {
          toast({
            title: 'Profil yüklənmədi',
            description: e.response?.data?.message || e.message,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [navigate, toast]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await authService.uploadAvatar(file);
      toast({ title: 'Avatar yeniləndi', status: 'success', duration: 3000, isClosable: true });
      await refreshAvatarPreview();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast({
        title: 'Yükləmə xətası',
        description: msg,
        status: 'error',
        duration: msg?.length > 120 ? 12000 : 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (form.newPassword || form.confirmPassword || form.currentPassword) {
      if (form.newPassword !== form.confirmPassword) {
        toast({ title: 'Şifrələr uyğun gəlmir', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      if (!form.currentPassword) {
        toast({ title: 'Cari şifrəni daxil edin', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
    }
    setSaving(true);
    try {
      const body = {
        displayName: form.displayName.trim() === '' ? '' : form.displayName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() === '' ? '' : form.phoneNumber.trim(),
      };
      if (form.newPassword && form.currentPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword = form.newPassword;
      }
      const updated = await authService.updateMe(body);
      setForm((f) => ({
        ...f,
        displayName: updated.displayName ?? '',
        email: updated.email ?? '',
        phoneNumber: updated.phoneNumber ?? '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      toast({ title: 'Profil saxlanıldı', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: 'Saxlanılmadı',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const user = authService.getCurrentUser();

  if (!user && !loading) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <Heading size="lg" color="gray.700">
              Profil
            </Heading>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Geri
            </Button>
          </HStack>

          <Card bg="white" borderWidth="1px" borderColor="gray.200">
            <CardHeader pb={2}>
              <Text fontWeight="semibold" color="gray.600">
                {user ? userDisplayName(user) : '…'} ({user?.username})
              </Text>
            </CardHeader>
            <CardBody pt={0}>
              {loading ? (
                <Text color="gray.500">Yüklənir…</Text>
              ) : (
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Profil şəkli</FormLabel>
                    <HStack spacing={4} align="center" flexWrap="wrap">
                      <HoverPreviewAvatar
                        size="xl"
                        src={avatarUrl || undefined}
                        name={userDisplayName(user)}
                        onError={() => {
                          setAvatarUrl((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
                        }}
                      />
                      <VStack align="start" spacing={2}>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarChange}
                          isDisabled={uploading}
                          size="sm"
                          maxW="280px"
                        />
                        <Text fontSize="sm" color="gray.500">
                          JPG, PNG və ya WEBP, maks. 2 MB.                           Şəkillər backend tərəfindən MinIO-da (bucket: hamilton, açarlar: application.yml → hamilton.minio) saxlanılır.
                          MinIO Docker root tez-tez minioadmin / minioadmin olur — uyğun gəlmirsə backend konfiqurasiyasını yeniləyin.
                        </Text>
                      </VStack>
                    </HStack>
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormLabel>Görünən ad</FormLabel>
                    <Input
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="Məs: Samir Həsənov"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Boş buraxsanız, sistemdə istifadəçi adınız göstərilir.
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={form.phoneNumber}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      placeholder="+994501234567"
                    />
                  </FormControl>

                  <Divider />

                  <Heading size="sm" color="gray.600">
                    Şifrəni dəyiş (istəyə görə)
                  </Heading>
                  <FormControl>
                    <FormLabel>Cari şifrə</FormLabel>
                    <Input
                      type="password"
                      value={form.currentPassword}
                      onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Yeni şifrə</FormLabel>
                    <Input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Yeni şifrə (təkrar)</FormLabel>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      autoComplete="new-password"
                    />
                  </FormControl>

                  <Button colorScheme="blue" onClick={handleSaveProfile} isLoading={saving} alignSelf="flex-start">
                    Dəyişiklikləri saxla
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
