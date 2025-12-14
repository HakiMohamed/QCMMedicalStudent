import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async submitAnswers(userId: string, answers: Array<{ questionId: string; choiceId: string }>) {
    const results = [];

    for (const answer of answers) {
      const question = await this.prisma.question.findUnique({
        where: { id: answer.questionId },
        include: {
          correctAnswers: true,
          choices: true,
        },
      });

      if (!question) {
        throw new NotFoundException(`Question ${answer.questionId} non trouvée`);
      }

      const isCorrect = question.correctAnswers.some(
        (ca) => ca.choiceId === answer.choiceId
      );

      await this.prisma.userAnswer.upsert({
        where: {
          userId_questionId_choiceId: {
            userId,
            questionId: answer.questionId,
            choiceId: answer.choiceId,
          },
        },
        update: {
          isCorrect,
        },
        create: {
          userId,
          questionId: answer.questionId,
          choiceId: answer.choiceId,
          isCorrect,
        },
      });

      results.push({
        questionId: answer.questionId,
        choiceId: answer.choiceId,
        isCorrect,
      });
    }

    await this.updateChapterProgress(userId, answers[0]?.questionId);

    return results;
  }

  private async updateChapterProgress(userId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        session: {
          include: {
            chapter: true,
          },
        },
      },
    });

    if (!question) return;

    const chapterId = question.session.chapterId;
    const totalQuestions = await this.prisma.question.count({
      where: {
        session: {
          chapterId,
        },
        isActive: true,
        deletedAt: null,
      },
    });

    const answeredQuestionsData = await this.prisma.userAnswer.findMany({
      where: {
        userId,
        question: {
          session: {
            chapterId,
          },
          isActive: true,
          deletedAt: null,
        },
      },
      select: {
        questionId: true,
      },
      distinct: ['questionId'],
    });
    const answeredQuestions = answeredQuestionsData.length;

    // Calculer les bonnes et mauvaises réponses
    const userAnswers = await this.prisma.userAnswer.findMany({
      where: {
        userId,
        question: {
          session: {
            chapterId,
          },
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        question: {
          include: {
            correctAnswers: true,
          },
        },
      },
    });

    // Compter les questions correctes et incorrectes
    const questionResults = new Map<string, { correctChoices: string[]; userChoices: string[] }>();
    userAnswers.forEach((ua) => {
      const questionId = ua.questionId;
      if (!questionResults.has(questionId)) {
        const correctChoiceIds = ua.question.correctAnswers.map((ca) => ca.choiceId);
        questionResults.set(questionId, {
          correctChoices: correctChoiceIds,
          userChoices: [ua.choiceId],
        });
      } else {
        const current = questionResults.get(questionId)!;
        if (!current.userChoices.includes(ua.choiceId)) {
          current.userChoices.push(ua.choiceId);
        }
      }
    });

    // Vérifier si chaque question est correcte
    let correctAnswers = 0;
    questionResults.forEach((result) => {
      const isCorrect =
        result.userChoices.length === result.correctChoices.length &&
        result.userChoices.every((id) => result.correctChoices.includes(id)) &&
        result.correctChoices.every((id) => result.userChoices.includes(id));
      if (isCorrect) {
        correctAnswers++;
      }
    });
    const wrongAnswers = answeredQuestions - correctAnswers;
    const score = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    const percentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // Déterminer le niveau
    let level = 'Débutant';
    if (score >= 90) {
      level = 'Excellent';
    } else if (score >= 75) {
      level = 'Très bien';
    } else if (score >= 60) {
      level = 'Bien';
    } else if (score >= 50) {
      level = 'Moyen';
    } else if (score >= 40) {
      level = 'Insuffisant';
    }

    await this.prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        wrongAnswers,
        score,
        level,
        percentage,
        lastAccessedAt: new Date(),
        completedAt: percentage === 100 ? new Date() : undefined,
      },
      create: {
        userId,
        chapterId,
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        wrongAnswers,
        score,
        level,
        percentage,
        lastAccessedAt: new Date(),
        completedAt: percentage === 100 ? new Date() : undefined,
      },
    });
  }

  async getUserProgress(userId: string) {
    try {
      return await this.prisma.userProgress.findMany({
        where: { userId },
        include: {
          chapter: {
            include: {
              part: {
                include: {
                  module: {
                    include: {
                      semester: {
                        include: {
                          academicYear: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      throw error;
    }
  }

  async getSessionResults(userId: string, sessionId: string) {
    const questions = await this.prisma.question.findMany({
      where: {
        sessionId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        choices: {
          orderBy: {
            order: 'asc',
          },
        },
        correctAnswers: {
          include: {
            choice: true,
          },
        },
        userAnswers: {
          where: { userId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const results = questions.map((q) => {
      const userAnswerIds = q.userAnswers.map((ua) => ua.choiceId);
      const correctAnswerIds = q.correctAnswers.map((ca) => ca.choiceId);
      
      // Pour les questions à choix multiples, vérifier que toutes les réponses sont correctes
      const isCorrect = 
        userAnswerIds.length === correctAnswerIds.length &&
        userAnswerIds.every((id) => correctAnswerIds.includes(id)) &&
        correctAnswerIds.every((id) => userAnswerIds.includes(id));

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        explanation: q.explanation,
        choices: q.choices,
        correctAnswers: correctAnswerIds,
        userAnswers: userAnswerIds,
        isCorrect,
      };
    });

    // Calculer les statistiques globales
    const totalQuestions = results.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrongCount = totalQuestions - correctCount;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Déterminer le niveau
    let level = 'Débutant';
    if (score >= 90) {
      level = 'Excellent';
    } else if (score >= 75) {
      level = 'Très bien';
    } else if (score >= 60) {
      level = 'Bien';
    } else if (score >= 50) {
      level = 'Moyen';
    } else if (score >= 40) {
      level = 'Insuffisant';
    }

    return {
      questions: results,
      statistics: {
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        score: Math.round(score * 100) / 100,
        level,
      },
    };
  }

  async checkAnswer(userId: string, questionId: string, choiceIds: string[]) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        correctAnswers: {
          include: {
            choice: true,
          },
        },
        choices: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question non trouvée');
    }

    const correctChoiceIds = question.correctAnswers.map((ca) => ca.choiceId);
    const isCorrect = 
      choiceIds.length === correctChoiceIds.length &&
      choiceIds.every((id) => correctChoiceIds.includes(id)) &&
      correctChoiceIds.every((id) => choiceIds.includes(id));

    return {
      questionId,
      isCorrect,
      correctAnswers: correctChoiceIds,
      explanation: question.explanation,
      choices: question.choices,
    };
  }
}

