import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Trouver l'année académique et le semestre si fournis
    let academicYearId: string | undefined;
    let semesterId: string | undefined;

    if (registerDto.academicYear && registerDto.semesterCode) {
      const academicYear = await this.prisma.academicYear.findFirst({
        where: { name: registerDto.academicYear, isActive: true },
      });

      if (academicYear) {
        academicYearId = academicYear.id;
        const semester = await this.prisma.semester.findUnique({
          where: { code: registerDto.semesterCode },
        });
        if (semester && semester.academicYearId === academicYear.id) {
          semesterId = semester.id;
        }
      }
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        academicYearId,
        accessType: 'TRIAL',
        accessExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Créer un accès gratuit de 7 jours pour le semestre choisi
    if (semesterId) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 jours à partir d'aujourd'hui

      await this.prisma.semesterAccess.create({
        data: {
          userId: user.id,
          semesterId,
          accessType: 'TRIAL',
          startDate: new Date(),
          expiryDate,
          isActive: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async refreshToken(refreshToken: string) {
    // Implementation à venir
    throw new Error('Not implemented');
  }

  async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    imageUrl?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const updatePayload: any = {};

    if (updateData.firstName !== undefined) updatePayload.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) updatePayload.lastName = updateData.lastName;
    if (updateData.imageUrl !== undefined) updatePayload.imageUrl = updateData.imageUrl;

    if (updateData.email !== undefined && updateData.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      updatePayload.email = updateData.email;
    }

    if (updateData.password) {
      updatePayload.passwordHash = await bcrypt.hash(updateData.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updatePayload,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true,
        imageUrl: true,
        accessType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

