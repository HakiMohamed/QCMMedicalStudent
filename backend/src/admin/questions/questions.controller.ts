import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin-questions')
@Controller('admin/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupère toutes les questions (Admin)' })
  async findAll(
    @Query('sessionId') sessionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questionsService.findAll(
      sessionId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une question par ID (Admin)' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une nouvelle question (Admin)' })
  async create(@Body() createQuestionDto: any) {
    return this.questionsService.create(createQuestionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Met à jour une question (Admin)' })
  async update(@Param('id') id: string, @Body() updateQuestionDto: any) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime une question (Admin)' })
  async delete(@Param('id') id: string) {
    return this.questionsService.delete(id);
  }
}

