import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID'));
  }

  // ─── REGISTER ───────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email sudah terdaftar!');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashed,
        role: 'CUSTOMER',
        profile: {
          create: {
            name: dto.name,
            phone: dto.phone || '',
            address: dto.address || '',
          },
        },
      },
      include: { profile: true },
    });

    return this.generateTokens(user);
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('Email atau password salah!');
    
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Email atau password salah!');

    return this.generateTokens(user);
  }

  // ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
  async loginWithGoogle(dto: GoogleAuthDto) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.credential,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new BadRequestException('Token Google tidak valid.');

    const { email, name, sub: googleSub } = payload;

    let user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      // Auto-register Google user
      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: await bcrypt.hash(`google-oauth-${googleSub}`, 10),
          role: 'CUSTOMER',
          profile: {
            create: {
              name: name || email.split('@')[0],
              phone: '',
              address: '',
            },
          },
        },
        include: { profile: true },
      });
    }

    return this.generateTokens(user);
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kadaluarsa.');
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { profile: true },
    });

    if (!user) throw new UnauthorizedException('User tidak ditemukan.');

    return this.generateTokens(user);
  }

  // ─── LOGOUT ──────────────────────────────────────────────────────────────────
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { isRevoked: true },
      });
    } else {
      // Revoke all tokens for user
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
    return { message: 'Logout berhasil.' };
  }

  // ─── HELPER: GENERATE TOKENS ──────────────────────────────────────────────────
  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1d',
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        email: user.email,
        role: String(user.role || 'CUSTOMER').toLowerCase(),
        name: user.profile?.name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        avatar: user.profile?.avatar || '',
      },
    };
  }
}
