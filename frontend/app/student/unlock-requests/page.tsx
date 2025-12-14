'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

interface UnlockRequest {
  id: string;
  semesterId: string;
  paymentProof: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  semester: {
    id: string;
    name: string;
    code: string;
    academicYear: {
      name: string;
    };
  };
}

export default function MyUnlockRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<UnlockRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/unlock-requests/my-requests');
      setRequests(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement de vos demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = (request: UnlockRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Paiement validé';
      case 'REJECTED':
        return 'Paiement rejeté';
      default:
        return 'En attente de validation';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon />;
      case 'REJECTED':
        return <CancelIcon />;
      default:
        return <PendingIcon />;
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
        <HistoryIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mes Demandes de Déverrouillage
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Aucune demande de déverrouillage
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Vous n'avez pas encore fait de demande de déverrouillage de semestre.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          {requests.map((request) => (
            <Card key={request.id} sx={{ position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {request.semester.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {request.semester.academicYear.name}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(request.status)}
                    label={getStatusLabel(request.status)}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Date de demande:</strong>{' '}
                    {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  {request.processedAt && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date de traitement:</strong>{' '}
                      {new Date(request.processedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  )}
                </Box>

                {request.adminNotes && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Note de l'administrateur:</strong>
                    </Typography>
                    <Typography variant="body2">{request.adminNotes}</Typography>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewProof(request)}
                  sx={{ mt: 1 }}
                >
                  Voir la preuve de paiement
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la demande</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Semestre:</strong> {selectedRequest.semester.name} ({selectedRequest.semester.academicYear.name})
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="textSecondary" component="span">
                  <strong>Statut:</strong>
                </Typography>
                <Chip
                  label={getStatusLabel(selectedRequest.status)}
                  color={getStatusColor(selectedRequest.status) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Date de demande:</strong>{' '}
                {new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              {selectedRequest.processedAt && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Date de traitement:</strong>{' '}
                  {new Date(selectedRequest.processedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              )}
              {selectedRequest.adminNotes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Notes de l'administrateur:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                    {selectedRequest.adminNotes}
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Preuve de paiement:</strong>
                </Typography>
                <img
                  src={selectedRequest.paymentProof}
                  alt="Preuve de paiement"
                  style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

