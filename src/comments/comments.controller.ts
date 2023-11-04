import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IUser } from 'src/type/users.interface';
import { ResponseMessage, UserReq } from 'src/decorator/customize';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ResponseMessage("Create a comment")
  @Post(":id")
  create(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto, @UserReq() user: IUser) {
    return this.commentsService.create(id, createCommentDto, user);
  }

  @ResponseMessage("Update a comment")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @UserReq() user: IUser) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @ResponseMessage("Delete a comment")
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.commentsService.remove(id, user);
  }
}
