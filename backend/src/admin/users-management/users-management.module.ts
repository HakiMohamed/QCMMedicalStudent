import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersManagementController } from './users-management.controller';
import { UsersManagementService } from './users-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersManagementController],
  providers: [UsersManagementService],
  exports: [UsersManagementService],
})
export class UsersManagementModule {}
