'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import apiClient from '@/lib/api';

interface Choice {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  explanation?: string;
  choices: Choice[];
}

export default function SessionTestPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    level: string;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, {
    isCorrect: boolean;
    correctAnswers: string[];
    explanation?: string;
  }>>({});
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/questions/session/${sessionId}`);
      setQuestions(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Réinitialiser la vérification si la réponse change
    if (checkedAnswers[questionId]) {
      setCheckedAnswers((prev) => {
        const newChecked = { ...prev };
        delete newChecked[questionId];
        return newChecked;
      });
    }
  };

  const handleCheckAnswer = async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) {
      setError('Veuillez sélectionner une réponse avant de vérifier');
      return;
    }

    try {
      setChecking(true);
      const choiceIds = Array.isArray(answer) ? answer : [answer];
      const response = await apiClient.post('/progress/check-answer', {
        questionId,
        choiceIds,
      });
      
      setCheckedAnswers((prev) => ({
        ...prev,
        [questionId]: response.data,
      }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError('Veuillez répondre à toutes les questions');
      return;
    }

    try {
      setSubmitting(true);
      const answersArray = Object.entries(answers).map(([questionId, choiceIds]) => {
        if (Array.isArray(choiceIds)) {
          return choiceIds.map((choiceId) => ({ questionId, choiceId }));
        }
        return [{ questionId, choiceId: choiceIds }];
      }).flat();

      await apiClient.post('/progress/submit', { answers: answersArray });

      const resultsResponse = await apiClient.get(`/progress/session/${sessionId}/results`);
      setResults(resultsResponse.data.questions || resultsResponse.data);
      if (resultsResponse.data.statistics) {
        setStatistics(resultsResponse.data.statistics);
      }
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const getScore = () => {
    if (statistics) {
      return statistics.score;
    }
    if (!results.length) return 0;
    const correct = results.filter((r) => r.isCorrect).length;
    return Math.round((correct / results.length) * 100);
  };

  const getLevel = () => {
    if (statistics) {
      return statistics.level;
    }
    const score = getScore();
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Très bien';
    if (score >= 60) return 'Bien';
    if (score >= 50) return 'Moyen';
    if (score >= 40) return 'Insuffisant';
    return 'Débutant';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (showResults) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/student')}
          sx={{ mb: 3 }}
        >
          Retour aux tests
        </Button>

        <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Résultats du Test
          </Typography>
          <Typography variant="h2" sx={{ color: '#ff6b35', fontWeight: 'bold', my: 2 }}>
            {getScore()}%
          </Typography>
          <Typography variant="h5" sx={{ color: '#1f2937', mb: 2 }}>
            Niveau : {getLevel()}
          </Typography>
          {statistics && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'green', fontWeight: 'bold' }}>
                  {statistics.correctAnswers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Bonnes réponses
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'red', fontWeight: 'bold' }}>
                  {statistics.wrongAnswers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Mauvaises réponses
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                  {statistics.totalQuestions}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total
                </Typography>
              </Box>
            </Box>
          )}
          <LinearProgress
            variant="determinate"
            value={getScore()}
            sx={{ height: 10, borderRadius: 5, mt: 2 }}
          />
        </Paper>

        <Box>
          {results.map((result, index) => (
            <Paper key={result.id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                {result.isCorrect ? (
                  <CheckCircleIcon sx={{ color: 'green', fontSize: 30 }} />
                ) : (
                  <CancelIcon sx={{ color: 'red', fontSize: 30 }} />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {result.text}
                  </Typography>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend">Vos réponses</FormLabel>
                    {result.choices.map((choice: Choice) => {
                      const isSelected = result.userAnswers.includes(choice.id);
                      const isCorrect = result.correctAnswers.includes(choice.id);
                      return (
                        <FormControlLabel
                          key={choice.id}
                          control={
                            <Checkbox
                              checked={isSelected}
                              disabled
                              sx={{
                                color: isCorrect ? 'green' : isSelected ? 'red' : 'gray',
                                '&.Mui-checked': {
                                  color: isCorrect ? 'green' : 'red',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                color: isCorrect
                                  ? 'green'
                                  : isSelected
                                  ? 'red'
                                  : 'inherit',
                                fontWeight: isCorrect ? 'bold' : 'normal',
                              }}
                            >
                              {choice.label}. {choice.text}
                              {isCorrect && ' ✓'}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </FormControl>
                  {result.explanation && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Explication :</strong> {result.explanation}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/student')}
        sx={{ mb: 3 }}
      >
        Retour
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Question {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Object.keys(answers).length} / {questions.length} répondues
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Paper>

      {currentQuestion && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            {currentQuestion.text}
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            {currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'TRUE_FALSE' ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.choices.map((choice) => {
                  const checked = checkedAnswers[currentQuestion.id];
                  const isSelected = answers[currentQuestion.id] === choice.id;
                  const isCorrect = checked?.correctAnswers.includes(choice.id);
                  return (
                    <FormControlLabel
                      key={choice.id}
                      value={choice.id}
                      control={<Radio />}
                      label={`${choice.label}. ${choice.text}`}
                      disabled={!!checked}
                      sx={{
                        mb: 1,
                        p: 2,
                        border: checked
                          ? isCorrect
                            ? '2px solid green'
                            : isSelected
                            ? '2px solid red'
                            : '1px solid #e0e0e0'
                          : '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: checked
                          ? isCorrect
                            ? 'rgba(76, 175, 80, 0.1)'
                            : isSelected
                            ? 'rgba(244, 67, 54, 0.1)'
                            : 'transparent'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: checked ? undefined : '#f5f5f5',
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            ) : (
              <Box>
                {currentQuestion.choices.map((choice) => {
                  const checked = checkedAnswers[currentQuestion.id];
                  const isSelected = (answers[currentQuestion.id] as string[])?.includes(choice.id) || false;
                  const isCorrect = checked?.correctAnswers.includes(choice.id);
                  return (
                    <FormControlLabel
                      key={choice.id}
                      control={
                        <Checkbox
                          checked={isSelected}
                          disabled={!!checked}
                          onChange={(e) => {
                            const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
                            if (e.target.checked) {
                              handleAnswerChange(currentQuestion.id, [...currentAnswers, choice.id]);
                            } else {
                              handleAnswerChange(
                                currentQuestion.id,
                                currentAnswers.filter((id) => id !== choice.id)
                              );
                            }
                          }}
                          sx={{
                            color: checked
                              ? isCorrect
                                ? 'green'
                                : isSelected
                                ? 'red'
                                : 'inherit'
                              : 'inherit',
                            '&.Mui-checked': {
                              color: checked
                                ? isCorrect
                                  ? 'green'
                                  : 'red'
                                : 'primary',
                            },
                          }}
                        />
                      }
                      label={`${choice.label}. ${choice.text}`}
                      sx={{
                        mb: 1,
                        p: 2,
                        border: checked
                          ? isCorrect
                            ? '2px solid green'
                            : isSelected
                            ? '2px solid red'
                            : '1px solid #e0e0e0'
                          : '1px solid #e0e0e0',
                        borderRadius: 1,
                        display: 'block',
                        backgroundColor: checked
                          ? isCorrect
                            ? 'rgba(76, 175, 80, 0.1)'
                            : isSelected
                            ? 'rgba(244, 67, 54, 0.1)'
                            : 'transparent'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: checked ? undefined : '#f5f5f5',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </FormControl>

          {checkedAnswers[currentQuestion.id] && (
            <Box sx={{ mt: 3 }}>
              {checkedAnswers[currentQuestion.id].isCorrect ? (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Correct ! Excellente réponse.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error" icon={<CancelIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Incorrect. La bonne réponse est :{' '}
                    {currentQuestion.choices
                      .filter((c) => checkedAnswers[currentQuestion.id].correctAnswers.includes(c.id))
                      .map((c) => c.label)
                      .join(', ')}
                  </Typography>
                </Alert>
              )}
              {checkedAnswers[currentQuestion.id].explanation && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Explication :</strong> {checkedAnswers[currentQuestion.id].explanation}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!checkedAnswers[currentQuestion.id] && answers[currentQuestion.id] && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleCheckAnswer(currentQuestion.id)}
                  disabled={checking || !answers[currentQuestion.id]}
                  sx={{
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    '&:hover': {
                      borderColor: '#e55a2b',
                      backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    },
                  }}
                >
                  {checking ? <CircularProgress size={20} /> : 'Vérifier'}
                </Button>
              )}
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  sx={{
                    backgroundColor: '#ff6b35',
                    '&:hover': { backgroundColor: '#e55a2b' },
                  }}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length !== questions.length}
                  sx={{
                    backgroundColor: '#ff6b35',
                    '&:hover': { backgroundColor: '#e55a2b' },
                  }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Soumettre le test'}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

