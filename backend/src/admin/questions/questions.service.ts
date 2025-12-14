import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionType } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(sessionId?: string, page = 1, limit = 10) {
    const where: any = {
      deletedAt: null,
    };

    if (sessionId) {
      where.sessionId = sessionId;
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          session: {
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
          },
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
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            chapter: true,
          },
        },
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
      },
    });

    if (!question) {
      throw new NotFoundException('Question non trouvée');
    }

    return question;
  }

  async create(data: {
    text: string;
    type: QuestionType;
    sessionId: string;
    explanation?: string;
    choices: Array<{
      label: string;
      text: string;
      order: number;
      isCorrect?: boolean;
    }>;
  }) {
    const session = await this.prisma.session.findUnique({
      where: { id: data.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    const question = await this.prisma.question.create({
      data: {
        text: data.text,
        type: data.type,
        sessionId: data.sessionId,
        explanation: data.explanation,
        order: 0, // Valeur par défaut, non utilisée pour le tri
        choices: {
          create: data.choices.map((choice) => ({
            label: choice.label,
            text: choice.text,
            order: choice.order,
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    // Créer les réponses correctes
    const correctChoiceIndices: number[] = [];
    data.choices.forEach((choice, index) => {
      if (choice.isCorrect) {
        correctChoiceIndices.push(index);
      }
    });

    if (correctChoiceIndices.length > 0) {
      await this.prisma.correctAnswer.createMany({
        data: correctChoiceIndices.map((index) => ({
          questionId: question.id,
          choiceId: question.choices[index].id,
        })),
      });
    }

    return this.findOne(question.id);
  }

  async update(id: string, data: Partial<{
    text: string;
    type: QuestionType;
    explanation: string;
    isActive: boolean;
    sessionId?: string;
    choices?: Array<{
      label: string;
      text: string;
      order: number;
      isCorrect?: boolean;
    }>;
  }>) {
    const question = await this.prisma.question.findUniqueOrThrow({ where: { id } });

    const { choices, ...questionData } = data;

    // Mettre à jour la question
    await this.prisma.question.update({
      where: { id },
      data: questionData,
    });

    // Si des choix sont fournis, les mettre à jour
    if (choices && choices.length > 0) {
      // Supprimer les anciennes réponses correctes
      await this.prisma.correctAnswer.deleteMany({
        where: { questionId: id },
      });

      // Supprimer les anciens choix
      await this.prisma.choice.deleteMany({
        where: { questionId: id },
      });

      // Créer les nouveaux choix
      const newChoices = await Promise.all(
        choices.map((choice) =>
          this.prisma.choice.create({
            data: {
              questionId: id,
              label: choice.label,
              text: choice.text,
              order: choice.order,
            },
          })
        )
      );

      // Créer les réponses correctes
      const correctChoices = choices
        .map((choice, index) => (choice.isCorrect ? newChoices[index] : null))
        .filter(Boolean);

      if (correctChoices.length > 0) {
        await this.prisma.correctAnswer.createMany({
          data: correctChoices.map((choice) => ({
            questionId: id,
            choiceId: choice!.id,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    await this.prisma.question.findUniqueOrThrow({ where: { id } });
    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Question supprimée avec succès' };
  }

  async getSessionQuestionsForStudent(sessionId: string) {
    const questions = await this.prisma.question.findMany({
      where: {
        sessionId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        choices: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      explanation: q.explanation,
      choices: q.choices,
    }));
  }
}

