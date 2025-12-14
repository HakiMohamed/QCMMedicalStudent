import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async findAll(partId?: string, page = 1, limit = 10) {
    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (partId) {
      where.partId = partId;
    }

    const skip = (page - 1) * limit;

    const [chapters, total] = await Promise.all([
      this.prisma.chapter.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          part: {
            select: {
              id: true,
              name: true,
              code: true,
              module: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.chapter.count({ where }),
    ]);

    return {
      data: chapters,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

