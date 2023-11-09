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
    try {
      const session = await this.commentModel.db.startSession();
      session.startTransaction();
  
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
        throw new BadRequestException('Bài viết không tồn tại');
      }
  
      updatedPost.comments.unshift(newComment._id); // Thêm bình luận vào đầu mảng
  
      await updatedPost.save(); // Cập nhật bài viết
  
      await session.commitTransaction();
      session.endSession();
  
      // Sau khi đã cập nhật bài viết, bạn có thể trả về bài viết với danh sách bình luận đã cập nhật
      return updatedPost.populate([
        { path: 'author', select: { _id: 1, name: 1, email: 1, avatar: 1, isActive: 1 } },
        { path: 'likes', select: { _id: 1, name: 1, email: 1, avatar: 1, isActive: 1 } },
        {
          path: 'comments',
          populate: {
            path: 'user',
            select: { _id: 1, name: 1, email: 1, avatar: 1, isActive: 1 },
          },
          select: { content: 1, user: 1, createdAt: 1 },
        },
      ]);
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error('Lỗi khi tạo bình luận: ' + error.message);
    }
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
