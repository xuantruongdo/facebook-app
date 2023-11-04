import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IUser } from 'src/type/users.interface';
import { Public, ResponseMessage, UserReq } from 'src/decorator/customize';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ResponseMessage('Create a post')
  @Post()
  create(@Body() createPostDto: CreatePostDto, @UserReq() user: IUser) {
    return this.postsService.create(createPostDto, user);
  }

  @ResponseMessage('Fetch all posts')
  @Get()
  findAll(@UserReq() user: IUser) {
    return this.postsService.findAll(user);
  }

  @Public()
  @ResponseMessage('Fetch a post by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ResponseMessage('Update a post')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UserReq() user: IUser,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.postsService.remove(id, user);
  }

  @ResponseMessage('Like a post')
  @Post('like/:id')
  handleLike(@Param('id') id: string, @UserReq() user: IUser) {
    return this.postsService.like(id, user);
  }
}
