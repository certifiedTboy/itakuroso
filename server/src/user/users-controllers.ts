import { Controller, Post, Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users-service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseHandler } from 'src/common/response-handler/response-handler';

// import { UpdateProductDto } from './dto/update-product.dto';
// import { User } from './schemas/user-schema';

@Controller({
  path: 'users/create',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);

      return ResponseHandler.ok(201, 'User created successfully', result || {});
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.message,
          description: 'Some error description',
        });
      }
    }
  }

  //   @Get(':id')
  //   async findOneUser(@Param('id') id: string): Promise<User | null> {
  //     const result: User | null = await this.usersService.findById(id);

  //     return result;
  //   }
}
