import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  RegisterUserDto,
  RegisterUserWithSocialDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { IUser } from 'src/type/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      role: 'USER_NORMAL',
      type: 'SYSTEM',
    });

    return newUser;
  }

  async findOneByUsername(username: string) {
    return await this.userModel.findOne({ email: username });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async updateUserToken(refreshToken: string, _id: string) {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  }

  async findUserByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken });
  }

  async findOne(id: string) {
    return await this.userModel
      .findById(id)
      .select('-password -refreshToken')
      .populate('followings', '_id name email avatar followers')
      .populate('followers', '_id name email avatar followings');
  }

  async followUser(id: string, user: IUser) {
    try {
      const sentUser = await this.userModel.findById(user?._id);
      const receivedUser = await this.userModel.findById(id);
  
           // Check if `sentUser` and `receivedUser` exist
           if (!sentUser || !receivedUser) {
            throw new BadRequestException('Không tồn tại user');
          }
    
          // Check if `receivedUser._id` is already in the `sentUser.followings` array
          const followingIndex = sentUser.followings.indexOf(receivedUser._id);
    
          // Check if `sentUser._id` is already in the `receivedUser.followers` array
          const followerIndex = receivedUser.followers.indexOf(sentUser._id);
    
          // If `receivedUser._id` is already in `sentUser.followings`, remove it
          if (followingIndex !== -1) {
            sentUser.followings.splice(followingIndex, 1);
          } else {
            // If it's not present, add `receivedUser._id` to the `sentUser.followings`
            sentUser.followings.push(receivedUser._id);
          }
    
          // If `sentUser._id` is already in `receivedUser.followers`, remove it
          if (followerIndex !== -1) {
            receivedUser.followers.splice(followerIndex, 1);
          } else {
            // If it's not present, add `sentUser._id` to the `receivedUser.followers`
            receivedUser.followers.push(sentUser._id);
          }
    
          // Update `receivedUser` in the database
          await this.userModel.findByIdAndUpdate(id, receivedUser);
    
          // Update `sentUser` in the database
          await this.userModel.findByIdAndUpdate(sentUser._id, sentUser);
    
          return 'ok';
        } catch (error) {
          throw new Error('Lỗi khi lưu thông tin người dùng');
        }
  }

  async fillAllWithId(data: any) {
    const { ids } = data;
    const onlineUsers = this.userModel.find({ _id: { $in: ids } }).select('-password -refreshToken')

    return onlineUsers;
  }

  async findAll(qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    const users = await this.userModel.find(filter).select('-password -refreshToken')
    return users
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
