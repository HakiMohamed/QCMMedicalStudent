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
import { UsersManagementService } from './users-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
export class UsersManagementController {
  constructor(private readonly usersManagementService: UsersManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les utilisateurs (Admin)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersManagementService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un utilisateur par ID (Admin)' })
  async findOne(@Param('id') id: string) {
    return this.usersManagementService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un nouvel utilisateur (Admin)' })
  async create(@Body() createUserDto: any) {
    return this.usersManagementService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Met à jour un utilisateur (Admin)' })
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersManagementService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime un utilisateur (Admin)' })
  async delete(@Param('id') id: string) {
    return this.usersManagementService.delete(id);
  }
}

