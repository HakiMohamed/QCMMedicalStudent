import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService) {}

  async getUserSemesterAccess(userId: string, semesterId: string) {
    const access = await this.prisma.semesterAccess.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    });

    if (!access) {
      return null;
    }

    // Vérifier si l'accès est encore valide
    const now = new Date();
    const isExpired = access.expiryDate && access.expiryDate < now;
    const isActive = access.isActive && !isExpired;

    return {
      ...access,
      isActive,
      isExpired,
    };
  }

  async getUserAllAccesses(userId: string) {
    const accesses = await this.prisma.semesterAccess.findMany({
      where: { userId },
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const now = new Date();
    return accesses.map((access) => {
      const isExpired = access.expiryDate && access.expiryDate < now;
      const isActive = access.isActive && !isExpired;
      return {
        ...access,
        isActive,
        isExpired,
      };
    });
  }

  async checkSemesterAccess(userId: string, semesterId: string): Promise<boolean> {
    const access = await this.getUserSemesterAccess(userId, semesterId);
    if (!access) {
      return false;
    }

    const now = new Date();
    if (access.expiryDate && access.expiryDate < now) {
      return false;
    }

    return access.isActive;
  }

  async getSemestersWithAccessStatus(userId: string) {
    const allSemesters = await this.prisma.semester.findMany({
      where: { isActive: true },
      include: {
        academicYear: true,
        semesterAccesses: {
          where: { userId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const now = new Date();
    return allSemesters.map((semester) => {
      const access = semester.semesterAccesses[0];
      const hasAccess = !!access;
      const isExpired = access?.expiryDate && access.expiryDate < now;
      const isActive = hasAccess && access.isActive && !isExpired;

      return {
        id: semester.id,
        code: semester.code,
        name: semester.name,
        academicYear: semester.academicYear,
        hasAccess,
        isActive,
        isExpired,
        accessType: access?.accessType || null,
        expiryDate: access?.expiryDate || null,
      };
    });
  }
}

