'use client';

import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { Login, PersonAdd, School, Quiz } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Box sx={{ color: '#ffffff', mb: 4, flex: 1 }}>
            <School sx={{ fontSize: 64, mb: 2, color: '#ff6b35' }} />
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Medical QCM Platform
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
              Plateforme de révision QCM médicale
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              Réviser efficacement vos examens médicaux avec des QCM interactifs
              et suivre votre progression en temps réel.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, width: '100%', maxWidth: 500 }}>
            <Paper
              elevation={6}
              sx={{
                p: 4,
                backgroundColor: '#ffffff',
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Quiz sx={{ fontSize: 48, color: '#ff6b35', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Commencez maintenant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connectez-vous ou créez un compte pour accéder à la plateforme
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  fullWidth
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    py: 1.5,
                    backgroundColor: '#ff6b35',
                    '&:hover': {
                      backgroundColor: '#e55a2b',
                    },
                  }}
                >
                  Se connecter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  fullWidth
                  size="large"
                  onClick={() => router.push('/register')}
                  sx={{
                    py: 1.5,
                    borderColor: '#1f2937',
                    color: '#1f2937',
                    '&:hover': {
                      borderColor: '#374151',
                      backgroundColor: 'rgba(31, 41, 55, 0.04)',
                    },
                  }}
                >
                  Créer un compte
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
