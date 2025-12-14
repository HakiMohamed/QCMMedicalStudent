'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';
import EntityImage from '@/lib/components/EntityImage';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterId = searchParams.get('semesterId');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [semester, setSemester] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any | null>(null);
  const [paymentProof, setPaymentProof] = useState<string>('');

  useEffect(() => {
    if (semesterId) {
      fetchSemester();
      fetchPaymentMethods();
    } else {
      setError('Semestre non spécifié');
      setLoading(false);
    }
  }, [semesterId]);

  const fetchSemester = async () => {
    try {
      const response = await apiClient.get(`/semesters?page=1&limit=1000`);
      const semesters = response.data.data || response.data;
      const foundSemester = Array.isArray(semesters)
        ? semesters.find((s: any) => s.id === semesterId)
        : null;

      if (foundSemester) {
        setSemester(foundSemester);
      } else {
        setError('Semestre non trouvé');
      }
    } catch (err: any) {
      setError('Erreur lors du chargement du semestre');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/payment-methods');
      const methods = response.data;
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des modes de paiement:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPaymentProof(base64);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      setError('Veuillez sélectionner un mode de paiement');
      return;
    }
    if (!paymentProof) {
      setError('Veuillez télécharger une preuve de paiement');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiClient.post('/unlock-requests', {
        semesterId,
        paymentProof,
      });
      setSuccess('Demande de déverrouillage envoyée avec succès. Vous serez notifié une fois qu\'elle sera traitée.');
      setTimeout(() => {
        router.push('/student');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <BankIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Paiement - {semester?.name}
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Sélectionnez un mode de paiement
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {paymentMethods.length === 0 ? (
            <Alert severity="info">
              Aucun mode de paiement disponible. Veuillez contacter l'administrateur.
            </Alert>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 3,
              }}
            >
              {paymentMethods.map((method) => (
                <Paper
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: selectedPaymentMethod?.id === method.id ? '2px solid #ff6b35' : '1px solid #e0e0e0',
                    bgcolor: selectedPaymentMethod?.id === method.id ? '#fff5f2' : 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <EntityImage
                      imageUrl={method.logo}
                      name={method.name}
                      type="user"
                      size={80}
                      fontSize={30}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {method.name}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {selectedPaymentMethod && (
            <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BankIcon sx={{ color: '#ff6b35' }} />
                Informations de paiement - {selectedPaymentMethod.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body1">
                  <strong>Bénéficiaire:</strong> Medical QCM Platform
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  <strong>RIB:</strong> {selectedPaymentMethod.rib}
                </Typography>
                <Typography variant="body1">
                  <strong>Montant:</strong> 500 MAD
                </Typography>
                {selectedPaymentMethod.qrCode && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>QR Code:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <img
                        src={selectedPaymentMethod.qrCode}
                        alt="QR Code"
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  </Box>
                )}
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Veuillez effectuer le virement et télécharger la preuve de paiement ci-dessous.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preuve de paiement
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Téléchargez une capture d'écran ou une photo du reçu de virement bancaire
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Télécharger la preuve de paiement
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
            {paymentProof && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={paymentProof}
                  alt="Preuve de paiement"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !paymentProof || !selectedPaymentMethod}
              sx={{
                backgroundColor: '#ff6b35',
                '&:hover': { backgroundColor: '#e55a2b' },
              }}
            >
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
            <Button variant="outlined" onClick={() => router.back()}>
              Annuler
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

