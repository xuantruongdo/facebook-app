import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ResponseMessage, UserReq } from 'src/decorator/customize';
import { IUser } from 'src/type/users.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ResponseMessage("Send a mesage")
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @UserReq() user: IUser) {
    return this.messagesService.create(createMessageDto, user);
  }

  @ResponseMessage("Fetch all mesages in chat group")
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.messagesService.findAll(id);
  }

}
