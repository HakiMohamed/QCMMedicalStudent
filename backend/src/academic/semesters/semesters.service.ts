import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private prisma: PrismaService) {}

  async findAll(academicYearId?: string, page = 1, limit = 10) {
    const where: any = {
      isActive: true,
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const skip = (page - 1) * limit;

    const [semesters, total] = await Promise.all([
      this.prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.semester.count({ where }),
    ]);

    return {
      data: semesters,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

