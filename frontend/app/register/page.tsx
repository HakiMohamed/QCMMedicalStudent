'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface AcademicYear {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  code: string;
  name: string;
  academicYearId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    academicYearId: '',
    semesterId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{
    academicYearId?: string;
    semesterId?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yearsResponse, semestersResponse] = await Promise.all([
          apiClient.get('/academic-years', {
            params: { page: 1, limit: 100 },
          }),
          apiClient.get('/semesters', {
            params: { page: 1, limit: 100 },
          }),
        ]);

        const yearsData = yearsResponse.data.data || yearsResponse.data;
        const semestersData = semestersResponse.data.data || semestersResponse.data;
        setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
        setSemesters(Array.isArray(semestersData) ? semestersData : []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setAcademicYears([]);
        setSemesters([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setFieldErrors({});
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Si l'année académique change, réinitialiser le semestre et charger les semestres correspondants
    if (name === 'academicYearId') {
      setFormData((prev) => ({
        ...prev,
        academicYearId: value,
        semesterId: '',
      }));

      const loadSemesters = async () => {
        try {
          const config = value 
            ? { params: { academicYearId: value, page: 1, limit: 100 } }
            : { params: { page: 1, limit: 100 } };
          const response = await apiClient.get('/semesters', config);
          const semestersData = response.data.data || response.data;
          setSemesters(Array.isArray(semestersData) ? semestersData : []);
        } catch (err) {
          console.error('Erreur lors du chargement des semestres:', err);
          setSemesters([]);
        }
      };

      loadSemesters();
    }

    setError('');
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Validation des champs obligatoires
    const errors: { academicYearId?: string; semesterId?: string } = {};
    if (!formData.academicYearId) {
      errors.academicYearId = 'L\'année académique est obligatoire';
    }
    if (!formData.semesterId) {
      errors.semesterId = 'Le semestre est obligatoire';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Trouver le code du semestre sélectionné
      const selectedSemester = semesters.find((s) => s.id === formData.semesterId);
      const selectedAcademicYear = academicYears.find((y) => y.id === formData.academicYearId);

      if (!selectedSemester || !selectedAcademicYear) {
        setError('Veuillez sélectionner une année académique et un semestre valides');
        setLoading(false);
        return;
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        academicYear: selectedAcademicYear.name,
        semesterCode: selectedSemester.code,
      };

      await apiClient.post('/auth/register', payload);

      // Redirection après inscription réussie
      router.push('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Inscription
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez votre compte pour commencer
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleTextFieldChange}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleTextFieldChange}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextFieldChange}
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleTextFieldChange}
                required
                helperText="Minimum 6 caractères"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth required error={!!fieldErrors.academicYearId}>
                  <InputLabel id="academic-year-label">Année académique *</InputLabel>
                  <Select
                    labelId="academic-year-label"
                    id="academicYearId"
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={(e) => {
                      handleSelectChange('academicYearId', e.target.value);
                      if (fieldErrors.academicYearId) {
                        setFieldErrors((prev) => ({ ...prev, academicYearId: undefined }));
                      }
                    }}
                    label="Année académique *"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.academicYearId && (
                    <FormHelperText>{fieldErrors.academicYearId}</FormHelperText>
                  )}
                </FormControl>

                <FormControl 
                  fullWidth 
                  required 
                  error={!!fieldErrors.semesterId}
                  disabled={!formData.academicYearId || loadingData}
                >
                  <InputLabel id="semester-label">Semestre *</InputLabel>
                  <Select
                    labelId="semester-label"
                    id="semesterId"
                    name="semesterId"
                    value={formData.semesterId}
                    onChange={(e) => {
                      handleSelectChange('semesterId', e.target.value);
                      if (fieldErrors.semesterId) {
                        setFieldErrors((prev) => ({ ...prev, semesterId: undefined }));
                      }
                    }}
                    label="Semestre *"
                  >
                    {semesters
                      .filter((s) => !formData.academicYearId || s.academicYearId === formData.academicYearId)
                      .map((semester) => (
                        <MenuItem key={semester.id} value={semester.id}>
                          {semester.code} - {semester.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.semesterId && (
                    <FormHelperText>{fieldErrors.semesterId}</FormHelperText>
                  )}
                  {!formData.academicYearId && !fieldErrors.semesterId && (
                    <FormHelperText>Sélectionnez d&apos;abord une année académique</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#ff6b35',
                '&:hover': {
                  backgroundColor: '#e55a2b',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

