import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les sessions actives' })
  @ApiQuery({ name: 'chapterId', required: false, description: 'Filtrer par chapitre' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  async findAll(
    @Query('chapterId') chapterId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sessionsService.findAll(
      chapterId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}

