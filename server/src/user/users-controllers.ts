import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { User } from './schemas/user-schema';

@Controller({
  path: 'users/create',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  //   @Get(':id')
  //   async findOneUser(@Param('id') id: string): Promise<User | null> {
  //     const result: User | null = await this.usersService.findById(id);

  //     return result;
  //   }
}
