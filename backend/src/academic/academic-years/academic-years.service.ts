import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcademicYearsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [academicYears, total] = await Promise.all([
      this.prisma.academicYear.findMany({
        where: {
          isActive: true,
        },
        skip,
        take: limit,
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          name: true,
          order: true,
          isActive: true,
        },
      }),
      this.prisma.academicYear.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      data: academicYears,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!year) {
      throw new NotFoundException('Année académique non trouvée');
    }

    return year;
  }

  async create(data: { name: string; order: number; imageUrl?: string }) {
    const existing = await this.prisma.academicYear.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Une année académique avec ce nom existe déjà');
    }

    const existingOrder = await this.prisma.academicYear.findUnique({
      where: { order: data.order },
    });

    if (existingOrder) {
      throw new ConflictException('Une année académique avec cet ordre existe déjà');
    }

    return this.prisma.academicYear.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ name: string; order: number; isActive: boolean; imageUrl?: string }>) {
    await this.findOne(id);

    if (data.name) {
      const existing = await this.prisma.academicYear.findUnique({
        where: { name: data.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Une année académique avec ce nom existe déjà');
      }
    }

    if (data.order !== undefined) {
      const existingOrder = await this.prisma.academicYear.findUnique({
        where: { order: data.order },
      });
      if (existingOrder && existingOrder.id !== id) {
        throw new ConflictException('Une année académique avec cet ordre existe déjà');
      }
    }

    return this.prisma.academicYear.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.academicYear.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Année académique désactivée avec succès' };
  }
}

