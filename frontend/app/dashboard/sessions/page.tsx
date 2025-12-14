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

interface Session {
  id: string;
  type: string;
  year: number;
  imageUrl?: string | null;
  isActive: boolean;
  chapter: {
    id: string;
    title: string;
    part: {
      id: string;
      name: string;
      module: {
        id: string;
        name: string;
        code: string;
        semester: {
          id: string;
          code: string;
          academicYear: {
            id: string;
            name: string;
          };
        };
      };
    };
  };
}

export default function SessionsManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSessions();
    fetchChapters();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sessions', {
        params: { page, limit },
      });
      setSessions(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await apiClient.get('/chapters', {
        params: { page: 1, limit: 100 }, // Récupérer tous les chapitres pour le select
      });
      const chaptersData = response.data.data || response.data;
      setChapters(Array.isArray(chaptersData) ? chaptersData : []);
    } catch (err) {
      console.error('Erreur lors du chargement des chapitres:', err);
      setChapters([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette session ?')) return;

    try {
      await apiClient.delete(`/admin/content/sessions/${id}`);
      setPage(1);
      fetchSessions();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'NORMAL' ? 'Normal' : 'Rattrapage';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des sessions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSession(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Créer une session
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
              <TableCell><strong>Année</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Année académique</strong></TableCell>
              <TableCell><strong>Semestre</strong></TableCell>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Chapitre</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">Aucune session trouvée</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell>{session.year}</TableCell>
                  <TableCell>
                    <Chip label={getTypeLabel(session.type)} size="small" />
                  </TableCell>
                  <TableCell>{session.chapter.part.module.semester.academicYear.name}</TableCell>
                  <TableCell>{session.chapter.part.module.semester.code}</TableCell>
                  <TableCell>{session.chapter.part.module.code} - {session.chapter.part.module.name}</TableCell>
                  <TableCell>{session.chapter.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={session.isActive ? 'Active' : 'Inactive'}
                      color={session.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingSession(session);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(session.id)}
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

      <SessionDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingSession(null);
        }}
        onSuccess={fetchSessions}
        session={editingSession}
        chapters={chapters}
      />
    </Box>
  );
}

function SessionDialog({
  open,
  onClose,
  onSuccess,
  session,
  chapters,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: Session | null;
  chapters: any[];
}) {
  const [formData, setFormData] = useState({
    type: 'NORMAL',
    year: new Date().getFullYear(),
    chapterId: '',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      setFormData({
        type: session.type,
        year: session.year,
        chapterId: session.chapter.id,
        imageUrl: session.imageUrl || null,
      });
    } else {
      setFormData({
        type: 'NORMAL',
        year: new Date().getFullYear(),
        chapterId: '',
        imageUrl: null,
      });
    }
  }, [session, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (session) {
        await apiClient.put(`/admin/content/sessions/${session.id}`, formData);
      } else {
        await apiClient.post('/admin/content/sessions', formData);
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
      <DialogTitle>{session ? 'Modifier la session' : 'Créer une session'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Chapitre</InputLabel>
            <Select
              value={formData.chapterId}
              onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
              label="Chapitre"
            >
              {chapters.map((chapter) => (
                <MenuItem key={chapter.id} value={chapter.id}>
                  {chapter.part.module.code} - {chapter.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Année"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
            required
            inputProps={{ min: 2000, max: 2100 }}
          />
          <FormControl fullWidth required>
            <InputLabel>Type de session</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              label="Type de session"
            >
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="RATTRAPAGE">Rattrapage</MenuItem>
            </Select>
          </FormControl>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            name={`Session ${formData.year}`}
            type="session"
            label="Image de la session"
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
          {loading ? <CircularProgress size={24} /> : session ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

