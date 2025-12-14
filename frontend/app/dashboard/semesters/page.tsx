'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';
import Pagination from '@/lib/components/Pagination';
import ImageUpload from '@/lib/components/ImageUpload';

interface Semester {
  id: string;
  code: string;
  name: string;
  imageUrl?: string | null;
  isActive: boolean;
  academicYear: {
    id: string;
    name: string;
  };
}

export default function SemestersManagementPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [page]);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/semesters', {
        params: { page, limit },
      });
      setSemesters(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des semestres');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await apiClient.get('/academic-years', {
        params: { page: 1, limit: 100 }, // Récupérer toutes les années pour le select
      });
      setAcademicYears(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des années académiques:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce semestre ?')) return;

    try {
      await apiClient.delete(`/admin/content/semesters/${id}`);
      setPage(1);
      fetchSemesters();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des semestres
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSemester(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter un semestre
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Année académique</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : semesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">Aucun semestre trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semester) => (
                <TableRow key={semester.id} hover>
                  <TableCell>{semester.code}</TableCell>
                  <TableCell>{semester.name}</TableCell>
                  <TableCell>{semester.academicYear?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={semester.isActive ? 'Actif' : 'Inactif'}
                      color={semester.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingSemester(semester);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(semester.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}

      <SemesterDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingSemester(null);
        }}
        onSuccess={fetchSemesters}
        semester={editingSemester}
        academicYears={academicYears}
      />
    </Box>
  );
}

function SemesterDialog({
  open,
  onClose,
  onSuccess,
  semester,
  academicYears,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  semester: Semester | null;
  academicYears: any[];
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    academicYearId: '',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (semester) {
      setFormData({
        code: semester.code,
        name: semester.name,
        academicYearId: semester.academicYear.id,
        imageUrl: semester.imageUrl || null,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        academicYearId: '',
        imageUrl: null,
      });
    }
  }, [semester, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (semester) {
        await apiClient.put(`/admin/content/semesters/${semester.id}`, formData);
      } else {
        await apiClient.post('/admin/content/semesters', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{semester ? 'Modifier le semestre' : 'Créer un semestre'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Année académique</InputLabel>
            <Select
              value={formData.academicYearId}
              onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
              label="Année académique"
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Ex: S1, S2"
          />
          <TextField
            fullWidth
            label="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Semestre 1"
          />
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            name={formData.name || formData.code || 'Semestre'}
            type="semester"
            label="Image du semestre"
            size={150}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          {loading ? <CircularProgress size={24} /> : semester ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

