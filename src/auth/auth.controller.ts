import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
  Req,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  RegisterUserWithSocialDto,
} from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage, UserReq } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { Request as RequestType, Response } from 'express';
import { IUser } from 'src/type/users.interface';
import { Cron } from '@nestjs/schedule';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthService.name);
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

  @Public()
  @ResponseMessage('Get user by refresh token')
  @Post('/refresh')
  handleRefreshToken(
    @Req() request: RequestType,
    @Res({ passthrough: true }) response: Response,
    @Body() data: any
  ) {
    // const refresh_token = request.cookies['refresh_token'];
    const { refresh_token } = data;
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

  @Public()
  @ResponseMessage('Fetch user with social media')
  @Post('/social-media')
  handleLoginWithSocial(
    @Body() registerUserWithSocialDto: RegisterUserWithSocialDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.loginWithSocial(registerUserWithSocialDto, response);
  }

  @Public()
  @ResponseMessage('Fix sleep backend')
  @Get()
  @Cron('*/1 * * * *')
  handleFixSleep() {
    this.logger.log('Calling API every 1 minutes');
    return 'fix ok'
  }
}
