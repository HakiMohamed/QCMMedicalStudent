'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    academicYears: 0,
    semesters: 0,
    questions: 0,
    modules: 0,
    chapters: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.users,
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      color: '#ff6b35',
    },
    {
      title: 'Années académiques',
      value: stats.academicYears,
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1f2937' }} />,
      color: '#1f2937',
    },
    {
      title: 'Semestres',
      value: stats.semesters,
      icon: <BookIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      color: '#ff6b35',
    },
    {
      title: 'Modules',
      value: stats.modules,
      icon: <BookIcon sx={{ fontSize: 40, color: '#1f2937' }} />,
      color: '#1f2937',
    },
    {
      title: 'Chapitres',
      value: stats.chapters,
      icon: <BookIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      color: '#ff6b35',
    },
    {
      title: 'Sessions',
      value: stats.sessions,
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1f2937' }} />,
      color: '#1f2937',
    },
    {
      title: 'Questions',
      value: stats.questions,
      icon: <QuizIcon sx={{ fontSize: 40, color: '#ff6b35' }} />,
      color: '#ff6b35',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Tableau de bord
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {statCards.map((card) => (
          <Card
            key={card.title}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: card.color }}>
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bienvenue sur le tableau de bord
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utilisez le menu de navigation pour accéder aux différentes sections de gestion.
        </Typography>
      </Paper>
    </Box>
  );
}

