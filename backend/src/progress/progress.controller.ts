import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Soumet les réponses d\'un étudiant' })
  async submitAnswers(@Request() req: any, @Body() body: { answers: Array<{ questionId: string; choiceId: string }> }) {
    return this.progressService.submitAnswers(req.user.id, body.answers);
  }

  @Get('my-progress')
  @ApiOperation({ summary: 'Récupère la progression de l\'utilisateur connecté' })
  async getMyProgress(@Request() req: any) {
    return this.progressService.getUserProgress(req.user.id);
  }

  @Get('session/:sessionId/results')
  @ApiOperation({ summary: 'Récupère les résultats d\'une session' })
  async getSessionResults(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.progressService.getSessionResults(req.user.id, sessionId);
  }

  @Post('check-answer')
  @ApiOperation({ summary: 'Vérifie si une réponse est correcte' })
  async checkAnswer(
    @Request() req: any,
    @Body() body: { questionId: string; choiceIds: string[] }
  ) {
    return this.progressService.checkAnswer(req.user.id, body.questionId, body.choiceIds);
  }
}

