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
import { PaymentMethodService } from './payment-method.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get()
  @ApiOperation({ summary: 'Récupère tous les modes de paiement actifs (public)' })
  async findAll() {
    return this.paymentMethodService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère tous les modes de paiement (Admin)' })
  async findAllForAdmin() {
    return this.paymentMethodService.findAllForAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un mode de paiement par ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentMethodService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crée un nouveau mode de paiement (Admin)' })
  async create(@Body() createDto: {
    name: string;
    logo?: string;
    rib: string;
    qrCode?: string;
    isActive?: boolean;
    order?: number;
  }) {
    return this.paymentMethodService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Met à jour un mode de paiement (Admin)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: {
      name?: string;
      logo?: string;
      rib?: string;
      qrCode?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    return this.paymentMethodService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprime un mode de paiement (Admin)' })
  async delete(@Param('id') id: string) {
    return this.paymentMethodService.delete(id);
  }
}

