'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import apiClient from '@/lib/api';
import ImageUpload from '@/lib/components/ImageUpload';
import EntityImage from '@/lib/components/EntityImage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studentId?: string;
  imageUrl?: string | null;
  accessType?: string;
  isActive?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    imageUrl: null as string | null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        imageUrl: userData.imageUrl || null,
      });
    } catch (err: any) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  const handleImageChange = (url: string | null) => {
    setFormData({
      ...formData,
      imageUrl: url,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setSaving(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        imageUrl: formData.imageUrl,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiClient.put('/auth/profile', updateData);
      setSuccess('Profil mis à jour avec succès');
      await fetchProfile();
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PersonIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mon Profil
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 2fr',
          },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <EntityImage
              imageUrl={formData.imageUrl}
              name={`${formData.firstName} ${formData.lastName}`}
              type="user"
              size={200}
              fontSize={80}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formData.email}
            </Typography>
            {user?.role && (
              <Typography variant="body2" color="textSecondary">
                Rôle: {user.role}
              </Typography>
            )}
            {user?.studentId && (
              <Typography variant="body2" color="textSecondary">
                Numéro étudiant: {user.studentId}
              </Typography>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Informations personnelles
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <ImageUpload
                value={formData.imageUrl}
                onChange={handleImageChange}
                name={`${formData.firstName} ${formData.lastName}`}
                type="user"
                label="Photo de profil"
                size={150}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
              />
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Changer le mot de passe (laisser vide pour ne pas changer)
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{
                  backgroundColor: '#ff6b35',
                  '&:hover': { backgroundColor: '#e55a2b' },
                }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

