import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContentModule } from './content/content.module';
import { UsersManagementModule } from './users-management/users-management.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    PrismaModule,
    DashboardModule,
    ContentModule,
    UsersManagementModule,
    QuestionsModule,
  ],
  exports: [
    DashboardModule,
    ContentModule,
    UsersManagementModule,
    QuestionsModule,
  ],
})
export class AdminModule {}

