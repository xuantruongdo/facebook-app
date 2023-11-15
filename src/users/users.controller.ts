import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, UserReq } from 'src/decorator/customize';
import { IUser } from 'src/type/users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ResponseMessage("Find all with id array")
  @Post('find-all-with-id')
  findAllWithId(@Body() data: any) {
    return this.usersService.fillAllWithId(data);
  }

  @Public()
  @ResponseMessage("Search user by name")
  @Get()
  findAll(@Query() qs: string) {
    return this.usersService.findAll(qs);
  }

  @Public()
  @ResponseMessage("Fetch user by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage("Follow/Unfollow a user")
  @Post('/follow/:id')
  handleFollowUser(@Param('id') id: string, @UserReq() user: IUser) {
    return this.usersService.followUser(id, user);
  }

  @Patch('/change-password')
  handleChangePassword( @Body() changePasswordDto: ChangePasswordDto, @UserReq() user: IUser) {
    return this.usersService.changePassword( changePasswordDto, user);
  }

  @ResponseMessage("Update info user")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UserReq() user: IUser) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
