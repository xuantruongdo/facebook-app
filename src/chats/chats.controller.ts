import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AddUserToGroupDto, CreateChatDto, CreateChatGroupDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ResponseMessage, UserReq } from 'src/decorator/customize';
import { IUser } from 'src/type/users.interface';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ResponseMessage("Access chat")
  @Post()
  handleAccessChat(@Body() createChatDto: CreateChatDto, @UserReq() user: IUser) {
    return this.chatsService.accessChat(createChatDto, user);
  }

  @ResponseMessage("Create a group chat")
  @Post("/create")
  handleCreateGroupChat(@Body() createChatGroupDto: CreateChatGroupDto, @UserReq() user: IUser) {
    return this.chatsService.create(createChatGroupDto, user);
  }

  @ResponseMessage("Fetch all chats current user")
  @Get()
  handleFetchChatsCurrentUser(@UserReq() user: IUser) {
    return this.chatsService.fetchChatsCurrentUser(user);
  }

  @ResponseMessage("Rename group chat")
  @Patch('/rename/:id')
  handleRenameGroup(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto, @UserReq() user: IUser) {
    return this.chatsService.renameGroup(id, updateChatDto, user);
  }

  @ResponseMessage("Add user to group chat")
  @Patch('/add/:id')
  handleAddUserToGroup(@Param('id') id: string, @Body() addUserToGroupDto: AddUserToGroupDto) {
    return this.chatsService.addUserToGroup(id, addUserToGroupDto);
  }

  @ResponseMessage("Remove user from group chat")
  @Patch('/remove/:id')
  handleRemoveFromGroup(@Param('id') id: string, @Body() addUserToGroupDto: AddUserToGroupDto) {
    return this.chatsService.removeUserFromGroup(id, addUserToGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatsService.remove(+id);
  }
}
