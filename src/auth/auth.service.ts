import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    // 1. Buscar si existe por googleId o por email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
    });

    // 2. Si el usuario ya existe pero no tenía vinculado el googleId, lo vinculamos
    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.googleId, avatar: googleUser.avatar },
        });
      }
    } else {
      // 3. Si no existe, creamos el usuario federado
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
        },
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}
