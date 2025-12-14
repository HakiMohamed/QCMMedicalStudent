import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, AccessType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersManagementService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          studentId: true,
          accessType: true,
          accessExpiryDate: true,
          isActive: true,
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true,
        accessType: true,
        accessExpiryDate: true,
        isActive: true,
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    studentId?: string;
    academicYearId?: string;
    accessType?: AccessType;
    imageUrl?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    let studentId = data.studentId;

    if (data.role === 'STUDENT' && !studentId) {
      studentId = await this.generateStudentId();
    }

    if (studentId) {
      const existingStudentId = await this.prisma.user.findUnique({
        where: { studentId: studentId },
      });

      if (existingStudentId) {
        throw new ConflictException('Ce numéro d\'étudiant est déjà utilisé');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        studentId: studentId,
        academicYearId: data.academicYearId,
        accessType: data.accessType || AccessType.TRIAL,
        imageUrl: data.imageUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true,
        accessType: true,
        isActive: true,
      },
    });
  }

  private async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const yearSuffix = year.toString().slice(-2);
    
    const lastStudent = await this.prisma.user.findFirst({
      where: {
        role: 'STUDENT',
        studentId: {
          startsWith: `STU-${yearSuffix}`,
        },
      },
      orderBy: {
        studentId: 'desc',
      },
    });

    let sequence = 1;
    if (lastStudent?.studentId) {
      const lastSequence = parseInt(lastStudent.studentId.split('-')[2] || '0');
      sequence = lastSequence + 1;
    }

    return `STU-${yearSuffix}-${sequence.toString().padStart(4, '0')}`;
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    studentId?: string;
    academicYearId?: string;
    accessType?: AccessType;
    isActive?: boolean;
    password?: string;
    imageUrl?: string;
  }) {
    const user = await this.findOne(id);

    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.studentId !== undefined) {
      if (data.studentId && data.studentId !== user.studentId) {
        const existing = await this.prisma.user.findUnique({
          where: { studentId: data.studentId },
        });
        if (existing) {
          throw new ConflictException('Ce numéro d\'étudiant est déjà utilisé');
        }
      }
      updateData.studentId = data.studentId;
    }
    if (data.academicYearId !== undefined) updateData.academicYearId = data.academicYearId;
    if (data.accessType !== undefined) updateData.accessType = data.accessType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true,
        accessType: true,
        isActive: true,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Utilisateur supprimé avec succès' };
  }
}

