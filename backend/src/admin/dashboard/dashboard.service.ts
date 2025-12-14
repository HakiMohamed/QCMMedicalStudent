import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      usersCount,
      academicYearsCount,
      semestersCount,
      modulesCount,
      partsCount,
      chaptersCount,
      sessionsCount,
      questionsCount,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { deletedAt: null },
      }),
      this.prisma.academicYear.count({
        where: { isActive: true },
      }),
      this.prisma.semester.count({
        where: { isActive: true },
      }),
      this.prisma.module.count({
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.part.count({
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.chapter.count({
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.session.count({
        where: { isActive: true },
      }),
      this.prisma.question.count({
        where: { isActive: true, deletedAt: null },
      }),
    ]);

    return {
      users: usersCount,
      academicYears: academicYearsCount,
      semesters: semestersCount,
      modules: modulesCount,
      parts: partsCount,
      chapters: chaptersCount,
      sessions: sessionsCount,
      questions: questionsCount,
    };
  }
}

