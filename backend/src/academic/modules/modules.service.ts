import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(semesterId?: string, page = 1, limit = 10) {
    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const skip = (page - 1) * limit;

    const [modules, total] = await Promise.all([
      this.prisma.module.findMany({
      where,
        skip,
        take: limit,
      orderBy: {
          createdAt: 'desc',
      },
      include: {
        semester: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      }),
      this.prisma.module.count({ where }),
    ]);

    return {
      data: modules,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

