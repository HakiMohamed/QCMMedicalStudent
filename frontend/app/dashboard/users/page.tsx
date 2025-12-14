'use client';

import apiClient from '@/lib/api';
import ImageUpload from '@/lib/components/ImageUpload';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studentId?: string;
  accessType: string;
  imageUrl?: string | null;
  isActive: boolean;
  academicYear?: {
    id: string;
    name: string;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchAcademicYears();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users', {
        params: { page, limit: 10, search },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await apiClient.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'SUPER_ADMIN':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingUser(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Rôle</strong></TableCell>
              <TableCell><strong>Numéro étudiant</strong></TableCell>
              <TableCell><strong>Type d&apos;accès</strong></TableCell>
              <TableCell><strong>Année académique</strong></TableCell>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">Aucun utilisateur trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell>{user.studentId || '-'}</TableCell>
                  <TableCell>{user.accessType}</TableCell>
                  <TableCell>{user.academicYear?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingUser(user);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user.id)}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <UserDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingUser(null);
        }}
        onSuccess={fetchUsers}
        user={editingUser}
        academicYears={academicYears}
      />
    </Box>
  );
}

function UserDialog({
  open,
  onClose,
  onSuccess,
  user,
  academicYears,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  academicYears: any[];
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    academicYearId: '',
    accessType: 'TRIAL',
    imageUrl: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        academicYearId: user.academicYear?.id || '',
        accessType: user.accessType,
        imageUrl: user.imageUrl || null,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'STUDENT',
        academicYearId: '',
        accessType: 'TRIAL',
        imageUrl: null,
      });
    }
  }, [user, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const submitData: any = { ...formData };
      
      if (submitData.role !== 'STUDENT') {
        delete submitData.academicYearId;
        delete submitData.accessType;
      }

      if (user) {
        const updateData: any = { ...submitData };
        if (!updateData.password) delete updateData.password;
        await apiClient.put(`/admin/users/${user.id}`, updateData);
      } else {
        if (!submitData.password) {
          setError('Le mot de passe est requis');
          setLoading(false);
          return;
        }
        await apiClient.post('/admin/users', submitData);
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
      <DialogTitle>{user ? "Modifier l'utilisateur" : 'Créer un utilisateur'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!!user}
            required
          />
          <TextField
            fullWidth
            label="Prénom"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Nom"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label={user ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Rôle"
            >
              <MenuItem value="STUDENT">Étudiant</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            </Select>
          </FormControl>
          {user && user.studentId && (
            <TextField
              fullWidth
              label="Numéro étudiant"
              value={user.studentId}
              disabled
              helperText="Le numéro d'étudiant ne peut pas être modifié"
            />
          )}
          {formData.role === 'STUDENT' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Année académique</InputLabel>
                <Select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  label="Année académique"
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {academicYears.map((year) => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type d&apos;accès</InputLabel>
                <Select
                  value={formData.accessType}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                  label="Type d'accès"
                >
                  <MenuItem value="TRIAL">Essai</MenuItem>
                  <MenuItem value="PAID">Payant</MenuItem>
                  <MenuItem value="INACTIVE">Inactif</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => {
              setFormData({ ...formData, imageUrl: url });
            }}
            name={formData.firstName && formData.lastName ? formData.firstName + ' ' + formData.lastName : 'Utilisateur'}
            type="user"
            label="Photo de profil"
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
          {loading ? <CircularProgress size={24} /> : user ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

