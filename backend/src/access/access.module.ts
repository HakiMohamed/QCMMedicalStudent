import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { UnlockRequestController } from './unlock-request.controller';
import { UnlockRequestService } from './unlock-request.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccessController, UnlockRequestController],
  providers: [AccessService, UnlockRequestService],
  exports: [AccessService, UnlockRequestService],
})
export class AccessModule {}

