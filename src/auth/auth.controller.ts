import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage, UserReq } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { Request as RequestType, Response } from 'express';
import { IUser } from 'src/type/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Register a user')
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login user')
  @Post('/login')
  handleLogin(@Request() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Fetch current account')
  @Get('/account')
  fetchCurrentAccount(@UserReq() user: IUser) {
    return { user };
  }

  @ResponseMessage('Get user by refresh token')
  @Post('/refresh')
  handleRefreshToken(
    @Req() request: RequestType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processNewToken(refresh_token, response);
  }

  @ResponseMessage('Logout user')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @UserReq() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
