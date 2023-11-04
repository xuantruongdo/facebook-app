import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Post, PostDocument } from 'src/posts/entities/post.entity';
import { IUser } from 'src/type/users.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: SoftDeleteModel<CommentDocument>,
    @InjectModel(Post.name)
    private postModel: SoftDeleteModel<PostDocument>,
  ) {}

  async create(_id, createCommentDto: CreateCommentDto, user: IUser) {
    let newComment = await this.commentModel.create({
      ...createCommentDto,
      user: user?._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    const updatedPost = await this.postModel.findById(_id);
    if (!updatedPost) {
      throw new BadRequestException("Bài viết không tồn tại")
    }

    await updatedPost.updateOne({ $push: { comments: newComment._id } });

    return {
      _id: newComment?._id,
      createdAt: newComment.createdAt,
    };

  }

  async update(_id: string, updateCommentDto: UpdateCommentDto, user: IUser) {
    return await this.commentModel.updateOne(
      { _id },
      {
        ...updateCommentDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );
  }

  async remove(_id: string, user: IUser) {
    await this.commentModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return this.commentModel.softDelete({ _id });
  }
}
