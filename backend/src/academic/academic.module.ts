import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SemestersModule } from './semesters/semesters.module';
import { ModulesModule } from './modules/modules.module';
import { PartsModule } from './parts/parts.module';
import { ChaptersModule } from './chapters/chapters.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    PrismaModule,
    AcademicYearsModule,
    SemestersModule,
    ModulesModule,
    PartsModule,
    ChaptersModule,
    SessionsModule,
  ],
  exports: [
    AcademicYearsModule,
    SemestersModule,
    ModulesModule,
    PartsModule,
    ChaptersModule,
    SessionsModule,
  ],
})
export class AcademicModule {}

