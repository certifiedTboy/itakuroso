import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user-schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(CreateUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(CreateUserDto);
    return createdUser.save();
  }

  async findUser(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}
