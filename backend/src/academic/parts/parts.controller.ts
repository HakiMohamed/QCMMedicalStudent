import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PartsService } from './parts.service';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les parties actives' })
  @ApiQuery({ name: 'moduleId', required: false, description: 'Filtrer par module' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page' })
  async findAll(
    @Query('moduleId') moduleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partsService.findAll(
      moduleId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}

