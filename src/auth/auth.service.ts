import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}

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

    delete user.hash;

    return user;
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
}
