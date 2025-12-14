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

interface Module {
  id: string;
  name: string;
  code: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  semester: {
    id: string;
    code: string;
    name: string;
  };
}

export default function ModulesManagementPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchModules();
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchModules();
  }, [page]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/modules', {
        params: { page, limit },
      });
      setModules(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await apiClient.get('/semesters', {
        params: { page: 1, limit: 100 }, // Récupérer tous les semestres pour le select
      });
      setSemesters(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des semestres:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) return;

    try {
      await apiClient.delete(`/admin/content/modules/${id}`);
      setPage(1);
      fetchModules();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des modules
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingModule(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter un module
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
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Semestre</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">Aucun module trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module) => (
                <TableRow key={module.id} hover>
                  <TableCell>{module.code}</TableCell>
                  <TableCell>{module.name}</TableCell>
                  <TableCell>{module.description || '-'}</TableCell>
                  <TableCell>{module.semester.code} - {module.semester.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={module.isActive ? 'Actif' : 'Inactif'}
                      color={module.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingModule(module);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(module.id)}
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

      <ModuleDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingModule(null);
        }}
        onSuccess={fetchModules}
        module={editingModule}
        semesters={semesters}
      />
    </Box>
  );
}

function ModuleDialog({
  open,
  onClose,
  onSuccess,
  module,
  semesters,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  module: Module | null;
  semesters: any[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    semesterId: '',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (module) {
      setFormData({
        name: module.name,
        description: module.description || '',
        semesterId: module.semester.id,
        imageUrl: module.imageUrl || null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        semesterId: '',
        imageUrl: null,
      });
    }
  }, [module, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (module) {
        await apiClient.put(`/admin/content/modules/${module.id}`, formData);
      } else {
        await apiClient.post('/admin/content/modules', formData);
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
      <DialogTitle>{module ? 'Modifier le module' : 'Créer un module'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Semestre</InputLabel>
            <Select
              value={formData.semesterId}
              onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
              label="Semestre"
            >
              {semesters.map((semester) => (
                <MenuItem key={semester.id} value={semester.id}>
                  {semester.code} - {semester.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {module && module.code && (
            <TextField
              fullWidth
              label="Code"
              value={module.code}
              disabled
              helperText="Le code ne peut pas être modifié"
            />
          )}
          <TextField
            fullWidth
            label="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            name={formData.name || 'Module'}
            type="module"
            label="Image du module"
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
          {loading ? <CircularProgress size={24} /> : module ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

