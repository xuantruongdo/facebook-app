import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Post, PostDocument } from 'src/posts/entities/post.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { INIT_POSTS } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Post.name) private postModel: SoftDeleteModel<PostDocument>,

    private configService: ConfigService,
    private usersService: UsersService,
  ) {}
  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countUser = await this.userModel.count({});
      const countPost = await this.postModel.count({});

      if (countUser === 0) {
        await this.userModel.insertMany([
          {
            name: "SUPER ADMIN",
            email: 'admin@gmail.com',
            avatar:
              'https://www.crescenttide.com/wp-content/uploads/2019/07/no-avatar-300x300.png',
            password: this.usersService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: 'SUPER_ADMIN',
            type: 'SYSTEM',
            isActive: false,
          },
          {
            name: "NORMAL USER",
            email: 'user@gmail.com',
            avatar:
              'https://www.crescenttide.com/wp-content/uploads/2019/07/no-avatar-300x300.png',
            password: this.usersService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: 'NORMAL_USER',
            type: 'SYSTEM',
            isActive: false,
          },
        ]);
      }

      if (countPost === 0) {
        await this.postModel.insertMany(INIT_POSTS);
      }
      
      if (countUser > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
      
    }
  }
}
