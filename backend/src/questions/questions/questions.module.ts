import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from '../../admin/questions/questions.service';
import { QuestionsModule as AdminQuestionsModule } from '../../admin/questions/questions.module';

@Module({
  imports: [PrismaModule, AdminQuestionsModule],
  controllers: [QuestionsController],
})
export class QuestionsFeatureModule {}
