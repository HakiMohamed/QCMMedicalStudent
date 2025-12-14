import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from '../../admin/questions/questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('questions')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Récupère les questions d\'une session (pour étudiants)' })
  async getSessionQuestions(@Param('sessionId') sessionId: string) {
    return this.questionsService.getSessionQuestionsForStudent(sessionId);
  }
}

