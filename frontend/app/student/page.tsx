'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';
import EntityImage from '@/lib/components/EntityImage';
import { useStudentNavigation } from '@/lib/contexts/StudentNavigationContext';

interface AcademicYear {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface Semester {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  imageUrl?: string | null;
}

interface Module {
  id: string;
  name: string;
  code: string;
  semesterId: string;
  imageUrl?: string | null;
}

interface Part {
  id: string;
  name: string;
  code: string;
  moduleId: string;
  imageUrl?: string | null;
}

interface Chapter {
  id: string;
  title: string;
  code: string;
  partId: string;
  imageUrl?: string | null;
}

interface Session {
  id: string;
  type: string;
  year: number;
  chapterId: string;
  imageUrl?: string | null;
}

type NavigationLevel = 'academicYear' | 'semester' | 'module' | 'part' | 'chapter' | 'session';

interface NavigationState {
  level: NavigationLevel;
  selectedAcademicYear: AcademicYear | null;
  selectedSemester: Semester | null;
  selectedModule: Module | null;
  selectedPart: Part | null;
  selectedChapter: Chapter | null;
}

export default function StudentPage() {
  const router = useRouter();
  const { setSelectedChapterId, setSessions: setContextSessions } = useStudentNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [semesterAccessStatus, setSemesterAccessStatus] = useState<Record<string, { 
    hasAccess: boolean; 
    isActive: boolean; 
    isExpired: boolean;
    accessType?: string;
    expiryDate?: string | null;
  }>>({});

  const [navState, setNavState] = useState<NavigationState>({
    level: 'academicYear',
    selectedAcademicYear: null,
    selectedSemester: null,
    selectedModule: null,
    selectedPart: null,
    selectedChapter: null,
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchSemesterAccessStatus();
    fetchAllSemesters();
  }, []);

  const fetchSemesterAccessStatus = async () => {
    try {
      const response = await apiClient.get('/access/semesters');
      const semestersWithStatus = response.data;
      const statusMap: Record<string, { 
        hasAccess: boolean; 
        isActive: boolean; 
        isExpired: boolean;
        accessType?: string;
        expiryDate?: string | null;
      }> = {};
      semestersWithStatus.forEach((s: any) => {
        statusMap[s.id] = {
          hasAccess: s.hasAccess,
          isActive: s.isActive,
          isExpired: s.isExpired,
          accessType: s.accessType,
          expiryDate: s.expiryDate,
        };
      });
      setSemesterAccessStatus(statusMap);
    } catch (err) {
      console.error('Erreur lors du chargement des statuts d\'accès:', err);
    }
  };

  const calculateDaysRemaining = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const fetchAllSemesters = async () => {
    try {
      const response = await apiClient.get('/semesters', {
        params: { page: 1, limit: 1000 },
      });
      const data = response.data.data || response.data;
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des semestres:', err);
    }
  };

  useEffect(() => {
    if (navState.selectedSemester) {
      fetchModules(navState.selectedSemester.id);
    }
  }, [navState.selectedSemester]);

  useEffect(() => {
    if (navState.selectedModule) {
      fetchParts(navState.selectedModule.id);
    }
  }, [navState.selectedModule]);

  useEffect(() => {
    if (navState.selectedPart) {
      fetchChapters(navState.selectedPart.id);
    }
  }, [navState.selectedPart]);

  useEffect(() => {
    if (navState.selectedChapter) {
      fetchSessions(navState.selectedChapter.id);
    }
  }, [navState.selectedChapter]);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/academic-years', {
        params: { page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des années académiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async (academicYearId: string) => {
    try {
      const response = await apiClient.get('/semesters', {
        params: { academicYearId, page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des semestres');
    }
  };

  const fetchModules = async (semesterId: string) => {
    try {
      const response = await apiClient.get('/modules', {
        params: { semesterId, page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      setModules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des modules');
    }
  };

  const fetchParts = async (moduleId: string) => {
    try {
      const response = await apiClient.get('/parts', {
        params: { moduleId, page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      setParts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des parties');
    }
  };

  const fetchChapters = async (partId: string) => {
    try {
      const response = await apiClient.get('/chapters', {
        params: { partId, page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      setChapters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des chapitres');
    }
  };

  const fetchSessions = async (chapterId: string) => {
    try {
      const response = await apiClient.get('/sessions', {
        params: { chapterId, page: 1, limit: 100 },
      });
      const data = response.data.data || response.data;
      const sessionsData = Array.isArray(data) ? data : [];
      setSessions(sessionsData);
      // Mettre à jour le Context pour la sidebar
      setContextSessions(sessionsData);
      setSelectedChapterId(chapterId);
    } catch (err: any) {
      setError('Erreur lors du chargement des sessions');
    }
  };

  const handleSelectAcademicYear = (year: AcademicYear) => {
    setNavState({
      level: 'semester',
      selectedAcademicYear: year,
      selectedSemester: null,
      selectedModule: null,
      selectedPart: null,
      selectedChapter: null,
    });
    setSemesters([]);
    setModules([]);
    setParts([]);
    setChapters([]);
    setSessions([]);
  };

  const handleSelectSemester = (semester: Semester) => {
    const accessStatus = semesterAccessStatus[semester.id];
    if (!accessStatus || !accessStatus.isActive) {
      // Rediriger vers la page de paiement
      router.push(`/student/payment?semesterId=${semester.id}`);
      return;
    }

    setNavState({
      ...navState,
      level: 'module',
      selectedSemester: semester,
      selectedModule: null,
      selectedPart: null,
      selectedChapter: null,
    });
    setModules([]);
    setParts([]);
    setChapters([]);
    setSessions([]);
  };

  const handleSelectModule = (module: Module) => {
    setNavState({
      ...navState,
      level: 'part',
      selectedModule: module,
      selectedPart: null,
      selectedChapter: null,
    });
    setParts([]);
    setChapters([]);
    setSessions([]);
  };

  const handleSelectPart = (part: Part) => {
    setNavState({
      ...navState,
      level: 'chapter',
      selectedPart: part,
      selectedChapter: null,
    });
    setChapters([]);
    setSessions([]);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setNavState({
      ...navState,
      level: 'session',
      selectedChapter: chapter,
    });
    setSessions([]);
    // Réinitialiser le Context
    setContextSessions([]);
    setSelectedChapterId(null);
  };

  const handleBack = () => {
    if (navState.level === 'semester') {
      setNavState({
        level: 'academicYear',
        selectedAcademicYear: null,
        selectedSemester: null,
        selectedModule: null,
        selectedPart: null,
        selectedChapter: null,
      });
      setSemesters([]);
    } else if (navState.level === 'module') {
      setNavState({
        ...navState,
        level: 'semester',
        selectedSemester: null,
        selectedModule: null,
        selectedPart: null,
        selectedChapter: null,
      });
      setModules([]);
    } else if (navState.level === 'part') {
      setNavState({
        ...navState,
        level: 'module',
        selectedModule: null,
        selectedPart: null,
        selectedChapter: null,
      });
      setParts([]);
    } else if (navState.level === 'chapter') {
      setNavState({
        ...navState,
        level: 'part',
        selectedPart: null,
        selectedChapter: null,
      });
      setChapters([]);
    } else if (navState.level === 'session') {
      setNavState({
        ...navState,
        level: 'chapter',
        selectedChapter: null,
      });
      setSessions([]);
      // Réinitialiser le Context
      setContextSessions([]);
      setSelectedChapterId(null);
    }
  };

  const handleReset = () => {
    setNavState({
      level: 'academicYear',
      selectedAcademicYear: null,
      selectedSemester: null,
      selectedModule: null,
      selectedPart: null,
      selectedChapter: null,
    });
    setSemesters([]);
    setModules([]);
    setParts([]);
    setChapters([]);
    setSessions([]);
    // Réinitialiser le Context
    setContextSessions([]);
    setSelectedChapterId(null);
  };

  const getBreadcrumbs = () => {
    const items = [
      { label: 'Accueil', onClick: handleReset },
    ];

    if (navState.selectedAcademicYear) {
      items.push({
        label: navState.selectedAcademicYear.name,
        onClick: () => handleSelectAcademicYear(navState.selectedAcademicYear!),
      });
    }
    if (navState.selectedSemester) {
      items.push({
        label: navState.selectedSemester.name,
        onClick: () => handleSelectSemester(navState.selectedSemester!),
      });
    }
    if (navState.selectedModule) {
      items.push({
        label: navState.selectedModule.name,
        onClick: () => handleSelectModule(navState.selectedModule!),
      });
    }
    if (navState.selectedPart) {
      items.push({
        label: navState.selectedPart.name,
        onClick: () => handleSelectPart(navState.selectedPart!),
      });
    }
    if (navState.selectedChapter) {
      items.push({
        label: navState.selectedChapter.title,
        onClick: () => handleSelectChapter(navState.selectedChapter!),
      });
    }

    return items;
  };

  const getStepIndex = () => {
    const steps = ['academicYear', 'semester', 'module', 'part', 'chapter', 'session'];
    return steps.indexOf(navState.level);
  };

  const renderContent = () => {
    if (navState.level === 'academicYear') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sélectionnez une année académique
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {academicYears.map((year) => {
              const yearSemesters = semesters.filter((s) => s.academicYearId === year.id);
              return (
                <Card
                  key={year.id}
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <CalendarIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {year.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      {yearSemesters.map((semester) => {
                        const accessStatus = semesterAccessStatus[semester.id];
                        const isLocked = !accessStatus || !accessStatus.isActive;
                        const isTrial = accessStatus?.accessType === 'TRIAL';
                        const daysRemaining = calculateDaysRemaining(accessStatus?.expiryDate);
                        return (
                          <Card
                            key={semester.id}
                            sx={{
                              transition: 'all 0.3s',
                              opacity: isLocked ? 0.7 : 1,
                              border: isLocked ? '1px solid #e0e0e0' : isTrial ? '1px solid #ff9800' : '1px solid #4caf50',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                              },
                            }}
                          >
                            <CardActionArea
                              onClick={() => handleSelectSemester(semester)}
                              sx={{ p: 2, height: '100%' }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isLocked ? (
                                      <LockIcon sx={{ color: '#9e9e9e', fontSize: 24 }} />
                                    ) : (
                                      <LockOpenIcon sx={{ color: isTrial ? '#ff9800' : '#4caf50', fontSize: 24 }} />
                                    )}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                      {semester.name}
                                    </Typography>
                                  </Box>
                                  {isTrial && !isLocked && (
                                    <Chip
                                      label="Essai gratuit"
                                      color="warning"
                                      size="small"
                                      sx={{
                                        backgroundColor: '#fff3e0',
                                        color: '#e65100',
                                        fontWeight: 'bold',
                                      }}
                                    />
                                  )}
                                  {isTrial && !isLocked && daysRemaining !== null && daysRemaining > 0 && (
                                    <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
                                      {daysRemaining === 1 
                                        ? '1 jour restant' 
                                        : `${daysRemaining} jours restants`}
                                    </Typography>
                                  )}
                                  {isTrial && !isLocked && daysRemaining !== null && daysRemaining === 0 && (
                                    <Typography variant="caption" color="error" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                      Essai expiré
                                    </Typography>
                                  )}
                                  {!isTrial && (
                                    <Chip
                                      icon={isLocked ? <LockIcon /> : <LockOpenIcon />}
                                      label={isLocked ? 'Verrouillé' : 'Déverrouillé'}
                                      color={isLocked ? 'default' : 'success'}
                                      size="small"
                                      sx={{
                                        backgroundColor: isLocked ? '#f5f5f5' : '#e8f5e9',
                                        color: isLocked ? '#757575' : '#2e7d32',
                                      }}
                                    />
                                  )}
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      );
    }

    if (navState.level === 'semester') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sélectionnez un semestre
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {semesters.map((semester) => {
              const accessStatus = semesterAccessStatus[semester.id];
              const isLocked = !accessStatus || !accessStatus.isActive;
              const isTrial = accessStatus?.accessType === 'TRIAL';
              const daysRemaining = calculateDaysRemaining(accessStatus?.expiryDate);
              
              return (
                <Card
                  key={semester.id}
                  sx={{
                    transition: 'all 0.3s',
                    opacity: isLocked ? 0.7 : 1,
                    border: isLocked ? '1px solid #e0e0e0' : isTrial ? '1px solid #ff9800' : '1px solid #4caf50',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectSemester(semester)}
                    sx={{ p: 3, height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EntityImage
                        imageUrl={semester.imageUrl}
                        name={semester.name}
                        type="semester"
                        size={120}
                        fontSize={40}
                      />
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {semester.name}
                          </Typography>
                          {isTrial && !isLocked && (
                            <>
                              <Chip
                                label="Essai gratuit"
                                color="warning"
                                size="small"
                                sx={{ 
                                  mt: 1,
                                  backgroundColor: '#fff3e0',
                                  color: '#e65100',
                                  fontWeight: 'bold',
                                }}
                              />
                              {daysRemaining !== null && daysRemaining > 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {daysRemaining === 1 
                                    ? '1 jour restant' 
                                    : `${daysRemaining} jours restants`}
                                </Typography>
                              )}
                              {daysRemaining !== null && daysRemaining === 0 && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontWeight: 'bold' }}>
                                  Essai expiré
                                </Typography>
                              )}
                            </>
                          )}
                          {!isTrial && (
                            <>
                              {isLocked ? (
                                <Chip
                                  icon={<LockIcon />}
                                  label="Verrouillé"
                                  color="default"
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              ) : (
                                <Chip
                                  icon={<LockOpenIcon />}
                                  label="Déverrouillé"
                                  color="success"
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </Box>
      );
    }

    if (navState.level === 'module') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sélectionnez un module
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {modules.map((module) => (
              <Card
                key={module.id}
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectModule(module)}
                  sx={{ p: 3, height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EntityImage
                        imageUrl={module.imageUrl}
                        name={module.name}
                        type="module"
                        size={120}
                        fontSize={40}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {module.code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {module.name}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      );
    }

    if (navState.level === 'part') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sélectionnez une partie
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {parts.map((part) => (
              <Card
                key={part.id}
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectPart(part)}
                  sx={{ p: 3, height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EntityImage
                        imageUrl={part.imageUrl}
                        name={part.name}
                        type="part"
                        size={120}
                        fontSize={40}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {part.code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {part.name}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      );
    }

    if (navState.level === 'chapter') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sélectionnez un chapitre
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {chapters.map((chapter) => (
              <Card
                key={chapter.id}
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectChapter(chapter)}
                  sx={{ p: 3, height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EntityImage
                        imageUrl={chapter.imageUrl}
                        name={chapter.title}
                        type="chapter"
                        size={120}
                        fontSize={40}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {chapter.code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {chapter.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      );
    }

    if (navState.level === 'session') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Sessions disponibles
          </Typography>
          {sessions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Aucune session disponible pour ce chapitre
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <QuizIcon sx={{ fontSize: 60, color: '#ff6b35', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Les sessions sont disponibles dans la barre latérale
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Sélectionnez une session dans le menu de gauche pour commencer votre test
              </Typography>
            </Paper>
          )}
        </Box>
      );
    }

    return null;
  };

  if (loading && navState.level === 'academicYear') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {showWelcome && (
        <Alert
          severity="info"
          onClose={() => setShowWelcome(false)}
          sx={{ mb: 3 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2">
            <strong>Bienvenue !</strong> Naviguez à travers la hiérarchie pour trouver vos tests QCM :
            Année académique → Semestre → Module → Partie → Chapitre → Session
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon sx={{ fontSize: 40, color: '#ff6b35' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Mes Tests QCM
          </Typography>
        </Box>
        {navState.level !== 'academicYear' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Retour">
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Retour à l'accueil">
              <IconButton onClick={handleReset} color="primary">
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {getBreadcrumbs().map((item, index) => (
            <Link
              key={index}
              component="button"
              variant="body1"
              onClick={item.onClick}
              sx={{
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {item.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={getStepIndex()} alternativeLabel>
          <Step>
            <StepLabel>Année académique</StepLabel>
          </Step>
          <Step>
            <StepLabel>Semestre</StepLabel>
          </Step>
          <Step>
            <StepLabel>Module</StepLabel>
          </Step>
          <Step>
            <StepLabel>Partie</StepLabel>
          </Step>
          <Step>
            <StepLabel>Chapitre</StepLabel>
          </Step>
          <Step>
            <StepLabel>Session</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Paper sx={{ p: 4 }}>
        {renderContent()}
      </Paper>
    </Box>
  );
}
