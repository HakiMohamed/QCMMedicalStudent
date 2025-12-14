import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SemestersService } from './semesters.service';

@ApiTags('semesters')
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les semestres actifs' })
  @ApiQuery({ name: 'academicYearId', required: false, description: 'Filtrer par année académique' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  async findAll(
    @Query('academicYearId') academicYearId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.semestersService.findAll(
      academicYearId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}

