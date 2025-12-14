import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { QuestionsFeatureModule } from './questions/questions.module';
import { ChoicesModule } from './choices/choices.module';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    QuestionsFeatureModule,
    ChoicesModule,
  ],
  exports: [
    SessionsModule,
    QuestionsFeatureModule,
    ChoicesModule,
  ],
})
export class QuestionsModule {}

