import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async findAll(moduleId?: string, page = 1, limit = 10) {
    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (moduleId) {
      where.moduleId = moduleId;
    }

    const skip = (page - 1) * limit;

    const [parts, total] = await Promise.all([
      this.prisma.part.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          module: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      data: parts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

