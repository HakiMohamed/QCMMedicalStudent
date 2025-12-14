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

interface Chapter {
  id: string;
  title: string;
  code: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  part: {
    id: string;
    name: string;
    code: string;
    module: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export default function ChaptersManagementPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchChapters();
    fetchParts();
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [page]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chapters', {
        params: { page, limit },
      });
      setChapters(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des chapitres');
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await apiClient.get('/parts', {
        params: { page: 1, limit: 100 }, // Récupérer toutes les parties pour le select
      });
      setParts(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des parties:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) return;

    try {
      await apiClient.delete(`/admin/content/chapters/${id}`);
      setPage(1);
      fetchChapters();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des chapitres
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingChapter(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter un chapitre
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
              <TableCell><strong>Titre</strong></TableCell>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Partie</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">Aucun chapitre trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => (
                <TableRow key={chapter.id} hover>
                  <TableCell>{chapter.title}</TableCell>
                  <TableCell>{chapter.code}</TableCell>
                  <TableCell>{chapter.description || '-'}</TableCell>
                  <TableCell>{chapter.part.module.code} - {chapter.part.module.name}</TableCell>
                  <TableCell>{chapter.part.code} - {chapter.part.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={chapter.isActive ? 'Actif' : 'Inactif'}
                      color={chapter.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingChapter(chapter);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(chapter.id)}
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

      <ChapterDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingChapter(null);
        }}
        onSuccess={fetchChapters}
        chapter={editingChapter}
        parts={parts}
      />
    </Box>
  );
}

function ChapterDialog({
  open,
  onClose,
  onSuccess,
  chapter,
  parts,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chapter: Chapter | null;
  parts: any[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partId: '',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        description: chapter.description || '',
        partId: chapter.part.id,
        imageUrl: chapter.imageUrl || null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        partId: '',
        imageUrl: null,
      });
    }
  }, [chapter, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (chapter) {
        await apiClient.put(`/admin/content/chapters/${chapter.id}`, formData);
      } else {
        await apiClient.post('/admin/content/chapters', formData);
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
      <DialogTitle>{chapter ? 'Modifier le chapitre' : 'Créer un chapitre'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Partie</InputLabel>
            <Select
              value={formData.partId}
              onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
              label="Partie"
            >
              {parts.map((part) => (
                <MenuItem key={part.id} value={part.id}>
                  {part.module.code} - {part.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Titre"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          {chapter && chapter.code && (
            <TextField
              fullWidth
              label="Code"
              value={chapter.code}
              disabled
              helperText="Le code ne peut pas être modifié"
            />
          )}
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
            name={formData.title || 'Chapitre'}
            type="chapter"
            label="Image du chapitre"
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
          {loading ? <CircularProgress size={24} /> : chapter ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

