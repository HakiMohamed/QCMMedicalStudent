import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';

@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les chapitres actifs' })
  @ApiQuery({ name: 'partId', required: false, description: 'Filtrer par partie' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  async findAll(
    @Query('partId') partId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chaptersService.findAll(
      partId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}

