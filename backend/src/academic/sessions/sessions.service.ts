import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(chapterId?: string, page = 1, limit = 10) {
    const where: any = {
      isActive: true,
    };

    if (chapterId) {
      where.chapterId = chapterId;
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          year: 'desc',
        },
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
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

