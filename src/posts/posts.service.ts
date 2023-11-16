import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IUser } from 'src/type/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entities/post.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Types } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: SoftDeleteModel<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, user: IUser) {
    let newPost = await this.postModel.create({
      ...createPostDto,
      author: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return {
      _id: newPost?._id,
      createdAt: newPost.createdAt,
    };
  }

  async findAll() {
    return await this.postModel.find().sort("-createdAt").populate([
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
  }

  async findAllWithAuthor(userId: string) {
    return await this.postModel.find({author: userId}).sort("-createdAt").populate([
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
  }

  async findOne(_id: string) {
    return await this.postModel.findById(_id).populate([
      { path: 'author', select: { _id: 1, name: 1, email: 1 } },
      { path: 'likes', select: { _id: 1, name: 1, email: 1 } },
      {
        path: 'comments',
        populate: {
          path: 'user',
          select: { _id: 1, name: 1, email: 1, avatar: 1, isActive: 1 },
        },
        select: { content: 1, user: 1 },
      },
    ]);
  }

  async update(_id: string, updatePostDto: UpdatePostDto, user: IUser) {

    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException("Bài viết không tồn tại")
    }

    if (post?.author.toString() !== user?._id) {
      throw new BadRequestException("Bạn không có quyền sửa bài viết này")
    }

    return await this.postModel.updateOne(
      { _id },
      {
        ...updatePostDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );
  }

  async remove(_id: string, user: IUser) {
    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException("Bài viết không tồn tại")
    }

    if (post?.author.toString() !== user?._id) {
      throw new BadRequestException("Bạn không có quyền xóa bài viết này")
    }
    await this.postModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return this.postModel.softDelete({ _id });
  }

  async like(_id: string, user: IUser) {
    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException('Không tồn tại bài viết');
    }

    const userId = new Types.ObjectId(user._id);
    const userLiked = post.likes.some((likeId) => likeId.equals(userId));

    if (userLiked) {
      // Nếu người dùng đã thích bài viết, xóa user._id khỏi mảng likes
      post.likes = post.likes.filter((likeId) => !likeId.equals(userId));
    } else {
      // Nếu người dùng chưa thích bài viết, thêm user._id vào mảng likes
      post.likes.push(userId);
    }

    // Lưu bài viết đã được cập nhật
    await post.save();

    // Trả về bài viết đã cập nhật
    return post.populate([
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
    ]);;
  }
}
