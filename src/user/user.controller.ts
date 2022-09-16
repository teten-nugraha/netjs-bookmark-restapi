import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guards';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('api/v1/user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() payload: EditUserDto) {
    return this.userService.editUser(userId, payload);
  }
}
