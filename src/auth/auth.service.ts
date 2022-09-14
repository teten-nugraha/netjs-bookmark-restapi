import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signin(payload: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials taken');
    }

    const passMatches = await argon.verify(user.hash, payload.password);

    if (!passMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async signup(payload: AuthDto) {
    // generate hash password
    const hash = await argon.hash(payload.password);

    try {
      //save new user into db
      const user = await this.prismaService.user.create({
        data: {
          email: payload.email,
          hash,
        },
      });

      delete user.hash;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const SECRET = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: SECRET,
    });

    return {
      access_token: token,
    };
  }
}
