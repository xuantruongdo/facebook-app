import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

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

  async findUserByToken (refreshToken: string) {
    return await this.userModel.findOne(
      {refreshToken}
    )
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
