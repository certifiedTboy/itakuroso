import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from 'src/common/mailer/mailer.service';
import { User } from './schemas/user-schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  async create(CreateUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(CreateUserDto);
    const user = await createdUser.save();
    await this.mailerService.sendMail(user.email, 'Welcome to our service');
    return user;
  }

  async findUser(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}
