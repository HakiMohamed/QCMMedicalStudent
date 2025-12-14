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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

interface UnlockRequest {
  id: string;
  userId: string;
  semesterId: string;
  paymentProof: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  semester: {
    id: string;
    name: string;
    code: string;
    academicYear: {
      name: string;
    };
  };
}

export default function UnlockRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<UnlockRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/unlock-requests');
      setRequests(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = (request: UnlockRequest) => {
    setSelectedRequest(request);
    setActionType('view');
    setDialogOpen(true);
  };

  const handleApprove = (request: UnlockRequest) => {
    setSelectedRequest(request);
    setActionType('approve');
    setAdminNotes('');
    setDialogOpen(true);
  };

  const handleReject = (request: UnlockRequest) => {
    setSelectedRequest(request);
    setActionType('reject');
    setAdminNotes('');
    setDialogOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.put(`/unlock-requests/${selectedRequest.id}/process`, {
        status: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
        adminNotes: adminNotes || undefined,
      });
      setSuccess(
        actionType === 'approve'
          ? 'Demande approuvée avec succès'
          : 'Demande rejetée avec succès',
      );
      setDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du traitement de la demande');
    } finally {
      setProcessing(false);
    }
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
        return 'Approuvée';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return 'En attente';
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
        <UnlockIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Demandes de déverrouillage
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Étudiant</TableCell>
                <TableCell>Semestre</TableCell>
                <TableCell>Date de demande</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Aucune demande de déverrouillage
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.user.firstName} {request.user.lastName}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {request.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.semester.name}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {request.semester.academicYear.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewProof(request)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {request.status === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(request)}
                              color="success"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(request)}
                              color="error"
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view'
            ? 'Preuve de paiement'
            : actionType === 'approve'
              ? 'Approuver la demande'
              : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'view' && selectedRequest && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Étudiant: {selectedRequest.user.firstName} {selectedRequest.user.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Semestre: {selectedRequest.semester.name}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <img
                  src={selectedRequest.paymentProof}
                  alt="Preuve de paiement"
                  style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
              </Box>
            </Box>
          )}
          {(actionType === 'approve' || actionType === 'reject') && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Étudiant: {selectedRequest?.user.firstName} {selectedRequest?.user.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                Semestre: {selectedRequest?.semester.name}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes (optionnel)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajoutez des notes pour cette demande..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          {actionType !== 'view' && (
            <Button
              onClick={handleProcess}
              variant="contained"
              disabled={processing}
              color={actionType === 'approve' ? 'success' : 'error'}
              sx={{
                backgroundColor: actionType === 'approve' ? '#4caf50' : '#f44336',
                '&:hover': {
                  backgroundColor: actionType === 'approve' ? '#45a049' : '#da190b',
                },
              }}
            >
              {processing
                ? 'Traitement...'
                : actionType === 'approve'
                  ? 'Approuver'
                  : 'Rejeter'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

