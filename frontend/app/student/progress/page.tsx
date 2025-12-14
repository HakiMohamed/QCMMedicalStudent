'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

interface Progress {
  id: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  level: string;
  percentage: number;
  lastAccessedAt: string;
  completedAt: string | null;
  chapter: {
    id: string;
    title: string;
    part: {
      name: string;
      module: {
        name: string;
        code: string;
        semester: {
          name: string;
          academicYear: {
            name: string;
          };
        };
      };
    };
  };
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/progress/my-progress');
      setProgress(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement de la progression');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const overallProgress =
    progress.length > 0
      ? progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length
      : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <BarChartIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Ma Progression
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Progression Globale
        </Typography>
        <Typography variant="h2" sx={{ color: '#ff6b35', fontWeight: 'bold', my: 2 }}>
          {Math.round(overallProgress)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{ height: 10, borderRadius: 5, mt: 2 }}
        />
      </Paper>

      {progress.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Aucune progression enregistrée pour le moment
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Commencez à passer des tests pour voir votre progression ici
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
            gap: 3,
          }}
        >
          {progress.map((item) => (
            <Box key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {item.chapter.title}
                      </Typography>
                      <Chip
                        label={`${item.chapter.part.module.semester.academicYear.name} - ${item.chapter.part.module.name}`}
                        size="small"
                        sx={{ backgroundColor: '#ff6b35', color: 'white', mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {item.chapter.part.name}
                      </Typography>
                    </Box>
                    {item.completedAt && (
                      <CheckCircleIcon sx={{ color: 'green', fontSize: 30 }} />
                    )}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.answeredQuestions} / {item.totalQuestions} questions
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff6b35' }}>
                        {Math.round(item.percentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    {item.answeredQuestions > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                            ✓ {item.correctAnswers || 0} correctes
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold' }}>
                            ✗ {item.wrongAnswers || 0} incorrectes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Score : {Math.round(item.score || 0)}%
                          </Typography>
                          <Chip
                            label={item.level || 'Débutant'}
                            size="small"
                            sx={{
                              backgroundColor: (item.score || 0) >= 75 ? '#4caf50' : (item.score || 0) >= 50 ? '#ff9800' : '#f44336',
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {item.lastAccessedAt && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                      Dernière activité : {new Date(item.lastAccessedAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

