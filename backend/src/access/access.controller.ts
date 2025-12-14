import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('access')
@Controller('access')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get('my-accesses')
  @ApiOperation({ summary: 'Récupère tous les accès de l\'utilisateur connecté' })
  async getMyAccesses(@Request() req: any) {
    return this.accessService.getUserAllAccesses(req.user.id);
  }

  @Get('semesters')
  @ApiOperation({ summary: 'Récupère tous les semestres avec leur statut d\'accès' })
  async getSemestersWithAccessStatus(@Request() req: any) {
    return this.accessService.getSemestersWithAccessStatus(req.user.id);
  }

  @Get('semester/:semesterId')
  @ApiOperation({ summary: 'Vérifie l\'accès à un semestre spécifique' })
  async checkSemesterAccess(@Request() req: any, @Param('semesterId') semesterId: string) {
    const hasAccess = await this.accessService.checkSemesterAccess(req.user.id, semesterId);
    const access = await this.accessService.getUserSemesterAccess(req.user.id, semesterId);
    return {
      hasAccess,
      access,
    };
  }
}

