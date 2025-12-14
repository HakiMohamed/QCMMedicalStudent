import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin-content')
@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Semesters
  @Post('semesters')
  @ApiOperation({ summary: 'Crée un nouveau semestre (Admin)' })
  async createSemester(@Body() createSemesterDto: any) {
    return this.contentService.createSemester(createSemesterDto);
  }

  @Put('semesters/:id')
  @ApiOperation({ summary: 'Met à jour un semestre (Admin)' })
  async updateSemester(@Param('id') id: string, @Body() updateSemesterDto: any) {
    return this.contentService.updateSemester(id, updateSemesterDto);
  }

  @Delete('semesters/:id')
  @ApiOperation({ summary: 'Supprime un semestre (Admin)' })
  async deleteSemester(@Param('id') id: string) {
    return this.contentService.deleteSemester(id);
  }

  // Modules
  @Post('modules')
  @ApiOperation({ summary: 'Crée un nouveau module (Admin)' })
  async createModule(@Body() createModuleDto: any) {
    return this.contentService.createModule(createModuleDto);
  }

  @Put('modules/:id')
  @ApiOperation({ summary: 'Met à jour un module (Admin)' })
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: any) {
    return this.contentService.updateModule(id, updateModuleDto);
  }

  @Delete('modules/:id')
  @ApiOperation({ summary: 'Supprime un module (Admin)' })
  async deleteModule(@Param('id') id: string) {
    return this.contentService.deleteModule(id);
  }

  // Parts
  @Post('parts')
  @ApiOperation({ summary: 'Crée une nouvelle partie (Admin)' })
  async createPart(@Body() createPartDto: any) {
    return this.contentService.createPart(createPartDto);
  }

  @Put('parts/:id')
  @ApiOperation({ summary: 'Met à jour une partie (Admin)' })
  async updatePart(@Param('id') id: string, @Body() updatePartDto: any) {
    return this.contentService.updatePart(id, updatePartDto);
  }

  @Delete('parts/:id')
  @ApiOperation({ summary: 'Supprime une partie (Admin)' })
  async deletePart(@Param('id') id: string) {
    return this.contentService.deletePart(id);
  }

  // Chapters
  @Post('chapters')
  @ApiOperation({ summary: 'Crée un nouveau chapitre (Admin)' })
  async createChapter(@Body() createChapterDto: any) {
    return this.contentService.createChapter(createChapterDto);
  }

  @Put('chapters/:id')
  @ApiOperation({ summary: 'Met à jour un chapitre (Admin)' })
  async updateChapter(@Param('id') id: string, @Body() updateChapterDto: any) {
    return this.contentService.updateChapter(id, updateChapterDto);
  }

  @Delete('chapters/:id')
  @ApiOperation({ summary: 'Supprime un chapitre (Admin)' })
  async deleteChapter(@Param('id') id: string) {
    return this.contentService.deleteChapter(id);
  }

  // Sessions
  @Post('sessions')
  @ApiOperation({ summary: 'Crée une nouvelle session (Admin)' })
  async createSession(@Body() createSessionDto: any) {
    return this.contentService.createSession(createSessionDto);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Met à jour une session (Admin)' })
  async updateSession(@Param('id') id: string, @Body() updateSessionDto: any) {
    return this.contentService.updateSession(id, updateSessionDto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Supprime une session (Admin)' })
  async deleteSession(@Param('id') id: string) {
    return this.contentService.deleteSession(id);
  }
}

