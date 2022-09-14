import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() payload: AuthDto) {
    return this.authService.signup(payload);
  }

  @Post('signin')
  signin(@Body() payload: AuthDto) {
    return this.authService.signin(payload);
  }
}
