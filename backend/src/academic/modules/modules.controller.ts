import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ModulesService } from './modules.service';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les modules actifs' })
  @ApiQuery({ name: 'semesterId', required: false, description: 'Filtrer par semestre' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  async findAll(
    @Query('semesterId') semesterId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.modulesService.findAll(
      semesterId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}

