'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as BankIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';
import ImageUpload from '@/lib/components/ImageUpload';
import EntityImage from '@/lib/components/EntityImage';

interface PaymentMethod {
  id: string;
  name: string;
  logo?: string | null;
  rib: string;
  qrCode?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    logo: null as string | null,
    rib: '',
    qrCode: null as string | null,
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/payment-methods/admin');
      setPaymentMethods(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des modes de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setSelectedMethod(method);
      setFormData({
        name: method.name,
        logo: method.logo || null,
        rib: method.rib,
        qrCode: method.qrCode || null,
        isActive: method.isActive,
        order: method.order,
      });
    } else {
      setSelectedMethod(null);
      setFormData({
        name: '',
        logo: null,
        rib: '',
        qrCode: null,
        isActive: true,
        order: paymentMethods.length,
      });
    }
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMethod(null);
    setFormData({
      name: '',
      logo: null,
      rib: '',
      qrCode: null,
      isActive: true,
      order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.rib) {
      setError('Le nom et le RIB sont obligatoires');
      return;
    }

    try {
      if (selectedMethod) {
        await apiClient.put(`/payment-methods/${selectedMethod.id}`, formData);
        setSuccess('Mode de paiement mis à jour avec succès');
      } else {
        await apiClient.post('/payment-methods', formData);
        setSuccess('Mode de paiement créé avec succès');
      }
      handleCloseDialog();
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!selectedMethod) return;

    try {
      await apiClient.delete(`/payment-methods/${selectedMethod.id}`);
      setSuccess('Mode de paiement supprimé avec succès');
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenDeleteDialog = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BankIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Modes de Paiement
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter un mode de paiement
        </Button>
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>RIB</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell>Ordre</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Aucun mode de paiement
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <EntityImage
                        imageUrl={method.logo}
                        name={method.name}
                        type="user"
                        size={50}
                        fontSize={20}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {method.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {method.rib}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {method.qrCode ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QrCodeIcon color="success" />
                          <Typography variant="body2" color="success.main">
                            Disponible
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Non disponible
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{method.order}</TableCell>
                    <TableCell>
                      <Chip
                        label={method.isActive ? 'Actif' : 'Inactif'}
                        color={method.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(method)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(method)}
                        color="error"
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
      </Paper>

      {/* Dialog de création/édition */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMethod ? 'Modifier le mode de paiement' : 'Ajouter un mode de paiement'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                name={formData.name || 'Banque'}
                type="user"
                label="Logo de la banque"
                size={150}
              />

              <TextField
                fullWidth
                label="Nom de la banque"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: CIH, Attijariwafa Bank, BMCE..."
              />

              <TextField
                fullWidth
                label="RIB"
                value={formData.rib}
                onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
                required
                placeholder="Ex: 123456789012345678901234"
                helperText="Numéro de compte bancaire (RIB)"
              />

              <ImageUpload
                value={formData.qrCode}
                onChange={(url) => setFormData({ ...formData, qrCode: url })}
                name={`QR Code ${formData.name || ''}`}
                type="user"
                label="QR Code (optionnel)"
                size={150}
              />

              <TextField
                fullWidth
                type="number"
                label="Ordre d'affichage"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                helperText="Ordre d'affichage (plus petit = affiché en premier)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Actif"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#ff6b35',
                '&:hover': { backgroundColor: '#e55a2b' },
              }}
            >
              {selectedMethod ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le mode de paiement "{selectedMethod?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

