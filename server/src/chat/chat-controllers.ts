import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import {
  BadRequestException,
  InternalServerErrorException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat-services';
import { ChatHelpers } from 'src/helpers/chat-helpers';
import { CreateRoomDto } from './dto/create-room.dto';
import { ResponseHandler } from '../common/response-handler/response-handler';
import { AuthService } from 'src/auth/auth-services';
import { AuthGuard } from '../guard/auth-guard';

/**
 * @class ChatControllers
 * @description Handles all chat-related HTTP requests.
 * This includes creating chat rooms and retrieving existing chat rooms.
 */
@Controller({
  path: 'chats',
  version: '1',
})
@UseGuards(AuthGuard)
export class ChatControllers {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  /**
   * @method createRoom
   * @description Handles room creation requests.
   * Validates the input data and creates a new chat room.
   * @param {CreateRoomDto} createRoomDto - The data transfer object containing room details.
   */
  @Post('create')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    try {
      const result = await this.chatService.createRoom(createRoomDto);

      return ResponseHandler.ok(
        201,
        'Chat room created successfully',
        result || {},
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * @method getCurrentUserRooms
   * @description Retrieves all chat rooms associated with the current user
   * @param {Request} req - The request object containing user information.
   */
  @Get('rooms')
  async getCurrentUserRooms(@Req() req: Request) {
    try {
      const currentUser = req.user;

      if (currentUser) {
        const rooms = await this.chatService.getAllRoomsByUser(
          currentUser?._id,
        );

        return ResponseHandler.ok(200, 'Rooms retrieved successfully', rooms);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * @method getAllRooms
   * @description Retrieves all existing chat rooms from the database.
   */
  @Get('all-rooms')
  async getAllRooms() {
    try {
      const rooms = await this.chatService.getAllRooms();

      return ResponseHandler.ok(200, 'Rooms retrieved successfully', rooms);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':chatRoomId')
  async getRoomChats(@Req() req: Request) {
    const { chatRoomId } = req.params;
    // const { page } = req.query;

    if (!chatRoomId) {
      throw new BadRequestException('Room ID is required');
    }

    // if (!page || typeof page !== 'string') {
    //   throw new BadRequestException(
    //     'Page query parameter is required and must be a string',
    //   );
    // }

    try {
      // const { limit, skip } = ChatHelpers.getPaginationParams(page);
      const chats = await this.chatService.findChatByRoomId(chatRoomId);

      return ResponseHandler.ok(200, 'Chats retrieved successfully', chats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('file/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.chatService.uploadFileOnCloud(file);

      return ResponseHandler.ok(200, 'File uploaded successfully', result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete('file/delete/:publicId')
  async deleteFile(@Req() req: Request) {
    const { publicId } = req.params;

    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      const result = await this.chatService.deleteUploadedFile(publicId);

      if (result?.result !== 'ok') {
        throw new InternalServerErrorException('Failed to delete file');
      }

      return ResponseHandler.ok(200, 'File deleted successfully', {
        deleted: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException('', {
          cause: error.cause,
          description: error.message,
        });
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
