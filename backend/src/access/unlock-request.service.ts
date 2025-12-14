import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnlockRequestService {
  constructor(private prisma: PrismaService) {}

  async createUnlockRequest(userId: string, semesterId: string, paymentProof: string) {
    // Vérifier que le semestre existe
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      throw new NotFoundException('Semestre non trouvé');
    }

    // Vérifier qu'il n'y a pas déjà une demande en attente
    const existingRequest = await this.prisma.unlockRequest.findFirst({
      where: {
        userId,
        semesterId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Une demande de déverrouillage est déjà en attente pour ce semestre');
    }

    // Vérifier que l'utilisateur n'a pas déjà accès
    const existingAccess = await this.prisma.semesterAccess.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    });

    if (existingAccess && existingAccess.isActive) {
      const now = new Date();
      if (!existingAccess.expiryDate || existingAccess.expiryDate > now) {
        throw new BadRequestException('Vous avez déjà accès à ce semestre');
      }
    }

    return this.prisma.unlockRequest.create({
      data: {
        userId,
        semesterId,
        paymentProof,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    });
  }

  async getUserUnlockRequests(userId: string) {
    return this.prisma.unlockRequest.findMany({
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
  }

  async getAllUnlockRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.unlockRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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
  }

  async processUnlockRequest(
    requestId: string,
    adminId: string,
    status: 'APPROVED' | 'REJECTED',
    adminNotes?: string,
  ) {
    const request = await this.prisma.unlockRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        semester: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Mettre à jour la demande
    const updatedRequest = await this.prisma.unlockRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes,
        processedAt: new Date(),
        processedBy: adminId,
      },
    });

    // Si approuvé, créer ou mettre à jour l'accès
    if (status === 'APPROVED') {
      // Calculer la date d'expiration (par exemple, 1 an à partir d'aujourd'hui)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await this.prisma.semesterAccess.upsert({
        where: {
          userId_semesterId: {
            userId: request.userId,
            semesterId: request.semesterId,
          },
        },
        update: {
          accessType: 'PAID',
          startDate: new Date(),
          expiryDate,
          isActive: true,
        },
        create: {
          userId: request.userId,
          semesterId: request.semesterId,
          accessType: 'PAID',
          startDate: new Date(),
          expiryDate,
          isActive: true,
        },
      });
    }

    return updatedRequest;
  }
}

