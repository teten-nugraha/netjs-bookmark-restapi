import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async editUser(idUser: number, payload: EditUserDto) {
    const user = await this.prismaService.user.update({
      where: {
        id: idUser,
      },
      data: {
        ...payload,
      },
    });

    delete user.hash;

    return user;
  }
}
