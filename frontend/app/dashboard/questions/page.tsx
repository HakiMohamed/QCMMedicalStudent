'use client';

import apiClient from '@/lib/api';
import Pagination from '@/lib/components/Pagination';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
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

interface Choice {
  id?: string;
  label: string;
  text: string;
  order: number;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: string;
  explanation?: string;
  isActive: boolean;
  session: {
    id: string;
    type: string;
    year: number;
    chapter: {
      id: string;
      title: string;
      part: {
        module: {
          name: string;
          code: string;
        };
      };
    };
  };
  choices: Choice[];
  correctAnswers: Array<{
    choiceId: string;
    choice: {
      label: string;
    };
  }>;
}

export default function QuestionsManagementPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [error, setError] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedSessionId]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSessionId, page]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/questions', {
        params: {
          ...(selectedSessionId ? { sessionId: selectedSessionId } : {}),
          page,
          limit,
        },
      });
      setQuestions(response.data.data || response.data);
      if (response.data.meta) {
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (err) {
      setError('Erreur lors du chargement des questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await apiClient.get('/sessions', {
        params: { page: 1, limit: 100 }, // Récupérer toutes les sessions pour le select
      });
      setSessions(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

    try {
      await apiClient.delete(`/admin/questions/${id}`);
      setPage(1);
      fetchQuestions();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return 'Choix unique';
      case 'MULTIPLE_CHOICE':
        return 'Choix multiples';
      case 'TRUE_FALSE':
        return 'Vrai/Faux';
      default:
        return type;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des questions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingQuestion(null);
            setOpenDialog(true);
          }}
          sx={{
            backgroundColor: '#ff6b35',
            '&:hover': { backgroundColor: '#e55a2b' },
          }}
        >
          Ajouter une question
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Filtrer par session</InputLabel>
          <Select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            label="Filtrer par session"
          >
            <MenuItem value="">Toutes les sessions</MenuItem>
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.chapter.part.module.code} - {session.chapter.title} ({session.year} - {session.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Question</strong></TableCell>
                {!selectedSessionId && <TableCell><strong>Session</strong></TableCell>}
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Choix</strong></TableCell>
                <TableCell><strong>Réponses correctes</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={!selectedSessionId ? 7 : 6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={!selectedSessionId ? 7 : 6} align="center">
                    <Typography color="textSecondary">Aucune question trouvée</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {question.text.substring(0, 100)}
                        {question.text.length > 100 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    {!selectedSessionId && (
                      <TableCell>
                        <Typography variant="body2">
                          {question.session.chapter.part.module.code} - {question.session.chapter.title}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {question.session.year} - {getTypeLabel(question.session.type)}
                          </Typography>
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip label={getTypeLabel(question.type)} size="small" />
                    </TableCell>
                    <TableCell>{question.choices.length}</TableCell>
                    <TableCell>
                      {question.correctAnswers.map((ca) => ca.choice.label).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={question.isActive ? 'Active' : 'Inactive'}
                        color={question.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingQuestion(question);
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(question.id)}
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
            onPageChange={handlePageChange}
          />
        )}

      <QuestionDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingQuestion(null);
        }}
        onSuccess={fetchQuestions}
        question={editingQuestion}
        sessions={sessions}
        defaultSessionId={selectedSessionId}
        onSessionsChange={fetchSessions}
      />
    </Box>
  );
}

function QuestionDialog({
  open,
  onClose,
  onSuccess,
  question,
  sessions,
  defaultSessionId,
  onSessionsChange,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  question: Question | null;
  sessions: any[];
  defaultSessionId: string;
  onSessionsChange: () => void;
}) {
  const [formData, setFormData] = useState({
    text: '',
    type: 'SINGLE_CHOICE',
    sessionId: defaultSessionId,
    explanation: '',
    choices: [
      { label: 'A', text: '', order: 1, isCorrect: false },
      { label: 'B', text: '', order: 2, isCorrect: false },
    ] as Choice[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
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
    fetchChapters();
  }, []);

  useEffect(() => {
    if (question) {
      const correctChoiceIds = new Set(question.correctAnswers.map((ca) => ca.choiceId));
      setFormData({
        text: question.text,
        type: question.type,
        sessionId: question.session.id,
        explanation: question.explanation || '',
        choices: question.choices.map((choice) => ({
          label: choice.label,
          text: choice.text,
          order: choice.order,
          isCorrect: correctChoiceIds.has(choice.id || ''),
        })),
      });
    } else {
      setFormData({
        text: '',
        type: 'SINGLE_CHOICE',
        sessionId: defaultSessionId,
        explanation: '',
        choices: [
          { label: 'A', text: '', order: 1, isCorrect: false },
          { label: 'B', text: '', order: 2, isCorrect: false },
        ],
      });
    }
  }, [question, open, defaultSessionId]);

  const handleAddChoice = () => {
    const nextLabel = String.fromCharCode(65 + formData.choices.length);
    setFormData({
      ...formData,
      choices: [
        ...formData.choices,
        { label: nextLabel, text: '', order: formData.choices.length + 1, isCorrect: false },
      ],
    });
  };

  const handleRemoveChoice = (index: number) => {
    if (formData.choices.length > 2) {
      setFormData({
        ...formData,
        choices: formData.choices.filter((_, i) => i !== index),
      });
    }
  };

  const handleChoiceChange = (index: number, field: keyof Choice, value: any) => {
    const newChoices = [...formData.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    
    if (field === 'isCorrect' && formData.type === 'SINGLE_CHOICE' && value) {
      newChoices.forEach((choice, i) => {
        if (i !== index) choice.isCorrect = false;
      });
    }
    
    setFormData({ ...formData, choices: newChoices });
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.text.trim()) {
      setError('Le texte de la question est requis');
      return;
    }

    if (formData.choices.length < 2) {
      setError('Au moins 2 choix sont requis');
      return;
    }

    if (formData.choices.some((c) => !c.text.trim())) {
      setError('Tous les choix doivent avoir un texte');
      return;
    }

    const correctCount = formData.choices.filter((c) => c.isCorrect).length;
    if (correctCount === 0) {
      setError('Au moins une réponse correcte est requise');
      return;
    }

    if (formData.type === 'SINGLE_CHOICE' && correctCount > 1) {
      setError('Une seule réponse correcte est autorisée pour les questions à choix unique');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        text: formData.text,
        type: formData.type,
        sessionId: formData.sessionId,
        explanation: formData.explanation || undefined,
        choices: formData.choices.map((c) => ({
          label: c.label,
          text: c.text,
          order: c.order,
          isCorrect: c.isCorrect,
        })),
      };

      if (question) {
        await apiClient.put(`/admin/questions/${question.id}`, payload);
      } else {
        await apiClient.post('/admin/questions', payload);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{question ? 'Modifier la question' : 'Créer une question'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <FormControl fullWidth required>
              <InputLabel>Session</InputLabel>
              <Select
                value={formData.sessionId}
                onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                label="Session"
              >
                {sessions.map((session) => (
                  <MenuItem key={session.id} value={session.id}>
                    {session.chapter.part.module.code} - {session.chapter.title} ({session.year} - {session.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setShowSessionDialog(true)}
              sx={{ minWidth: 150, mt: 1 }}
            >
              Créer session
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Texte de la question"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
            multiline
            rows={3}
          />

          <FormControl fullWidth required>
            <InputLabel>Type de question</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value;
                const newChoices = formData.choices.map((c) => ({
                  ...c,
                  isCorrect: newType === 'SINGLE_CHOICE' && c.isCorrect ? (formData.choices.findIndex((ch) => ch.isCorrect) === formData.choices.indexOf(c) ? c.isCorrect : false) : c.isCorrect,
                }));
                if (newType === 'SINGLE_CHOICE') {
                  const firstCorrect = newChoices.find((c) => c.isCorrect);
                  newChoices.forEach((c) => {
                    c.isCorrect = c === firstCorrect;
                  });
                }
                setFormData({ ...formData, type: newType, choices: newChoices });
              }}
              label="Type de question"
            >
              <MenuItem value="SINGLE_CHOICE">Choix unique</MenuItem>
              <MenuItem value="MULTIPLE_CHOICE">Choix multiples</MenuItem>
              <MenuItem value="TRUE_FALSE">Vrai/Faux</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Explication (optionnelle)"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            multiline
            rows={2}
          />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Choix de réponse ({formData.choices.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.choices.map((choice, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                      label="Label"
                      value={choice.label}
                      onChange={(e) => handleChoiceChange(index, 'label', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                    <TextField
                      label="Texte du choix"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={choice.isCorrect || false}
                          onChange={(e) => handleChoiceChange(index, 'isCorrect', e.target.checked)}
                        />
                      }
                      label="Correct"
                    />
                    {formData.choices.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveChoice(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddChoice}
                  size="small"
                >
                  Ajouter un choix
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
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
          {loading ? <CircularProgress size={24} /> : question ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>

      <SessionDialog
        open={showSessionDialog}
        onClose={() => {
          setShowSessionDialog(false);
        }}
        onSuccess={async () => {
          await onSessionsChange();
          const response = await apiClient.get('/sessions');
          const newSessions = response.data;
          if (newSessions.length > 0) {
            setFormData({ ...formData, sessionId: newSessions[newSessions.length - 1].id });
          }
          setShowSessionDialog(false);
        }}
        chapters={chapters}
      />
    </Dialog>
  );
}

function SessionDialog({
  open,
  onClose,
  onSuccess,
  chapters,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chapters: any[];
}) {
  const [formData, setFormData] = useState({
    type: 'NORMAL',
    year: new Date().getFullYear(),
    chapterId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData({
        type: 'NORMAL',
        year: new Date().getFullYear(),
        chapterId: '',
      });
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.chapterId) {
      setError('Le chapitre est requis');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/admin/content/sessions', formData);
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
      <DialogTitle>Créer une nouvelle session</DialogTitle>
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
          {loading ? <CircularProgress size={24} /> : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

