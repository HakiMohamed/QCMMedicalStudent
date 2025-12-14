'use client';

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import Pagination from '@/lib/components/Pagination';
import ImageUpload from '@/lib/components/ImageUpload';

interface Part {
  id: string;
  name: string;
  code?: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  module: {
    id: string;
    code?: string;
    name: string;
  };
}

export default function PartsManagementPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchParts();
    fetchModules();
  }, []);

  useEffect(() => {
    fetchParts();
  }, [page]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/parts', {
        params: { page, limit },
      });
      setParts(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des parties');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await apiClient.get('/modules', {
        params: { page: 1, limit: 100 },
      });
      setModules(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des modules:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette partie ?')) return;

    try {
      await apiClient.delete(`/admin/content/parts/${id}`);
      setPage(1);
      fetchParts();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des Parties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingPart(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter une partie
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
              <TableCell><strong>Module</strong></TableCell>
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
            ) : parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">Aucune partie trouvée</Typography>
                </TableCell>
              </TableRow>
            ) : (
              parts.map((part) => (
                <TableRow key={part.id} hover>
                  <TableCell>{part.code || '-'}</TableCell>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{part.description || '-'}</TableCell>
                  <TableCell>{part.module.code} - {part.module.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={part.isActive ? 'Actif' : 'Inactif'}
                      color={part.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingPart(part);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(part.id)}
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

      <PartDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingPart(null);
        }}
        onSuccess={fetchParts}
        part={editingPart}
        modules={modules}
      />
    </Box>
  );
}

function PartDialog({
  open,
  onClose,
  onSuccess,
  part,
  modules,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  part: Part | null;
  modules: any[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    moduleId: '',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        description: part.description || '',
        moduleId: part.module.id,
        imageUrl: part.imageUrl || null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        moduleId: '',
        imageUrl: null,
      });
    }
  }, [part, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (part) {
        await apiClient.put(`/admin/content/parts/${part.id}`, formData);
      } else {
        await apiClient.post('/admin/content/parts', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{part ? 'Modifier la partie' : 'Créer une partie'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Module</InputLabel>
            <Select
              value={formData.moduleId}
              onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              label="Module"
            >
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.code} - {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {part && part.code && (
            <TextField
              fullWidth
              label="Code"
              value={part.code}
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
            name={formData.name || 'Partie'}
            type="part"
            label="Image de la partie"
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
          {loading ? 'Enregistrement...' : part ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

