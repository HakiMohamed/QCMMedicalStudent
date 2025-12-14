import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnlockRequestService } from './unlock-request.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('unlock-requests')
@Controller('unlock-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnlockRequestController {
  constructor(private readonly unlockRequestService: UnlockRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une demande de déverrouillage' })
  async createUnlockRequest(
    @Request() req: any,
    @Body() body: { semesterId: string; paymentProof: string },
  ) {
    return this.unlockRequestService.createUnlockRequest(
      req.user.id,
      body.semesterId,
      body.paymentProof,
    );
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Récupère les demandes de déverrouillage de l\'utilisateur connecté' })
  async getMyUnlockRequests(@Request() req: any) {
    return this.unlockRequestService.getUserUnlockRequests(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Récupère toutes les demandes de déverrouillage (Admin)' })
  async getAllUnlockRequests(@Request() req: any) {
    return this.unlockRequestService.getAllUnlockRequests();
  }

  @Put(':id/process')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Traiter une demande de déverrouillage (Admin)' })
  async processUnlockRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; adminNotes?: string },
  ) {
    return this.unlockRequestService.processUnlockRequest(
      id,
      req.user.id,
      body.status,
      body.adminNotes,
    );
  }
}

