import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionType } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Semesters Management
  async createSemester(data: {
    code: string;
    name: string;
    academicYearId: string;
    imageUrl?: string;
  }) {
    const existing = await this.prisma.semester.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Un semestre avec ce code existe déjà');
    }

    return this.prisma.semester.create({
      data: {
        ...data,
        order: 0, // Valeur par défaut, non utilisée pour le tri
      },
      include: {
        academicYear: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateSemester(id: string, data: Partial<{
    code: string;
    name: string;
    academicYearId: string;
    isActive: boolean;
    imageUrl?: string;
  }>) {
    await this.prisma.semester.findUniqueOrThrow({ where: { id } });

    if (data.code) {
      const existing = await this.prisma.semester.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Un semestre avec ce code existe déjà');
      }
    }

    return this.prisma.semester.update({
      where: { id },
      data,
      include: {
        academicYear: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async deleteSemester(id: string) {
    await this.prisma.semester.findUniqueOrThrow({ where: { id } });
    await this.prisma.semester.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Semestre désactivé avec succès' };
  }

  // Modules Management
  async createModule(data: {
    name: string;
    description?: string;
    semesterId: string;
    imageUrl?: string;
  }) {
    const code = await this.generateModuleCode(data.semesterId);

    return this.prisma.module.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        semesterId: data.semesterId,
        imageUrl: data.imageUrl,
        order: 0, // Valeur par défaut, non utilisée pour le tri
      },
      include: {
        semester: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  private async generateModuleCode(semesterId: string): Promise<string> {
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
      select: { code: true },
    });

    const prefix = semester ? `MOD-${semester.code}-` : 'MOD-';

    const lastModule = await this.prisma.module.findFirst({
      where: {
        semesterId,
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastModule?.code) {
      const parts = lastModule.code.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  async updateModule(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    imageUrl?: string;
  }>) {
    await this.prisma.module.findUniqueOrThrow({ where: { id } });

    return this.prisma.module.update({
      where: { id },
      data,
      include: {
        semester: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async deleteModule(id: string) {
    await this.prisma.module.findUniqueOrThrow({ where: { id } });
    await this.prisma.module.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Module supprimé avec succès' };
  }

  // Parts Management
  async createPart(data: {
    name: string;
    description?: string;
    moduleId: string;
    imageUrl?: string;
  }) {
    const code = await this.generatePartCode(data.moduleId);

    return this.prisma.part.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        moduleId: data.moduleId,
        imageUrl: data.imageUrl,
        order: 0, // Valeur par défaut, non utilisée pour le tri
      },
      include: {
        module: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  private async generatePartCode(moduleId: string): Promise<string> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { code: true },
    });

    const prefix = module?.code ? `PART-${module.code}-` : 'PART-';

    const lastPart = await this.prisma.part.findFirst({
      where: {
        moduleId,
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastPart?.code) {
      const parts = lastPart.code.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  async updatePart(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    imageUrl?: string;
  }>) {
    await this.prisma.part.findUniqueOrThrow({ where: { id } });

    return this.prisma.part.update({
      where: { id },
      data,
      include: {
        module: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async deletePart(id: string) {
    await this.prisma.part.findUniqueOrThrow({ where: { id } });
    await this.prisma.part.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Partie supprimée avec succès' };
  }

  // Chapters Management
  async createChapter(data: {
    title: string;
    description?: string;
    partId: string;
    imageUrl?: string;
  }) {
    const code = await this.generateChapterCode(data.partId);

    return this.prisma.chapter.create({
      data: {
        title: data.title,
        code,
        description: data.description,
        partId: data.partId,
        imageUrl: data.imageUrl,
        order: 0, // Valeur par défaut, non utilisée pour le tri
      },
      include: {
        part: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  private async generateChapterCode(partId: string): Promise<string> {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
      select: { code: true },
    });

    const prefix = part?.code ? `CHAP-${part.code}-` : 'CHAP-';

    const lastChapter = await this.prisma.chapter.findFirst({
      where: {
        partId,
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastChapter?.code) {
      const parts = lastChapter.code.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  async updateChapter(id: string, data: Partial<{
    title: string;
    description: string;
    isActive: boolean;
    imageUrl?: string;
  }>) {
    await this.prisma.chapter.findUniqueOrThrow({ where: { id } });

    return this.prisma.chapter.update({
      where: { id },
      data,
      include: {
        part: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async deleteChapter(id: string) {
    await this.prisma.chapter.findUniqueOrThrow({ where: { id } });
    await this.prisma.chapter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Chapitre supprimé avec succès' };
  }

  // Sessions Management
  async createSession(data: {
    type: string;
    year: number;
    chapterId: string;
    imageUrl?: string;
  }) {
    const existing = await this.prisma.session.findUnique({
      where: {
        type_year_chapterId: {
          type: data.type as any,
          year: data.year,
          chapterId: data.chapterId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Une session avec ces paramètres existe déjà');
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: data.chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé');
    }

    return this.prisma.session.create({
      data: {
        type: data.type as any,
        year: data.year,
        chapterId: data.chapterId,
        imageUrl: data.imageUrl,
        isActive: true,
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
    });
  }

  async updateSession(id: string, data: Partial<{
    type: string;
    year: number;
    isActive: boolean;
    imageUrl?: string;
  }>) {
    const session = await this.prisma.session.findUniqueOrThrow({ where: { id } });

    if (data.type || data.year !== undefined) {
      const newType = data.type || session.type;
      const newYear = data.year !== undefined ? data.year : session.year;

      const existing = await this.prisma.session.findUnique({
        where: {
          type_year_chapterId: {
            type: newType as SessionType,
            year: newYear,
            chapterId: session.chapterId,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Une session avec ces paramètres existe déjà');
      }
    }

    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type as SessionType;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.session.update({
      where: { id },
      data: updateData,
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
    });
  }

  async deleteSession(id: string) {
    await this.prisma.session.findUniqueOrThrow({ where: { id } });
    await this.prisma.session.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Session désactivée avec succès' };
  }
}

