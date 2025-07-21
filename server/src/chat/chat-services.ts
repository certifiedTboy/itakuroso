import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room-schema';
import { Chat, ChatDocument } from './schemas/chat-schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessageQueue } from './schemas/message-queue';
import { QueueNodeType } from './schemas/message-queue';
import { QueueService } from '../queue/queue-service';
import { FileUploadService } from '../common/file-upload/file-upload-service';

/**
 * @class UsersService
 * @description Manages all user-related operations.
 * This includes creating users, verifying them, and finding users by their ID or verification code.
 */
@Injectable()
export class ChatService {
  private users: {
    contactName: string;
    roomId: string;
    phoneNumber: string;
  }[] = [];
  private activeUserPools: {
    contactName: string;
    phoneNumber: string;
  }[] = [];
  messageQueue: MessageQueue[] = [];
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly configService: ConfigService,
    private readonly imageUploadQueue: QueueService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * @method userJoin
   * @description Adds a user to the active users list or updates their information if they already exist.
   * @param {Object} params - The parameters containing user details.
   * @param {string} params.contactName - The name of the user.
   * @param {string} params.roomId - The ID of the room the user is joining.
   * @param {string} params.phoneNumber - The phone number of the user.
   */
  userJoin({
    contactName,
    roomId,
    phoneNumber,
  }: {
    contactName: string;
    roomId: string;
    phoneNumber: string;
  }) {
    const user = { contactName, roomId, phoneNumber };

    const findUserIndexIfExist = this.users.findIndex(
      (activeUser: {
        contactName: string;
        roomId: string;
        phoneNumber: string;
      }) => activeUser.phoneNumber === user.phoneNumber,
    );

    if (findUserIndexIfExist >= 0) {
      this.users[findUserIndexIfExist] = user;

      return user;
    }
    this.users.push(user);
    return user;
  }

  /**
   * @method getRoomUsers
   * @description Retrieves all users in a specific room based on the room ID.
   * @param {string} roomId - The ID of the room to find users in.
   */
  getRoomUsers(roomId: string) {
    return this.users.filter(
      (activeUser: {
        contactName: string;
        roomId: string;
        phoneNumber: string;
      }) => activeUser.roomId === roomId,
    );
  }

  /**
   * @method getCurrentUserByPhoneNumber
   * @description Retrieves the current user based on their phone number.
   * @param {string} phoneNumber - The phone number of the user to find.
   */
  getCurrentUserByPhoneNumber(phoneNumber: string) {
    return this.users.find(
      (activeUser: {
        contactName: string;
        roomId: string;
        phoneNumber: string;
      }) => activeUser.phoneNumber === phoneNumber,
    );
  }

  /**
   * @method userLeave
   * @description Removes a user from the active users list based on their phone number.
   * @param {string} phoneNumber - The phone number of the user to be removed.
   */
  userLeave(phoneNumber: string) {
    const index = this.users.findIndex(
      (activeUser: { phoneNumber: string }) =>
        activeUser.phoneNumber === phoneNumber,
    );

    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
  }

  /**
   * @method addUserToActivePool
   * @description Adds a user to the active user pool or updates their information if they already
   * @param {Object} user - The user object containing contact name and phone number.
   */
  addUserToActivePool(user: { contactName: string; phoneNumber: string }) {
    const existingUserIndex = this.activeUserPools.findIndex(
      (activeUser) => activeUser.phoneNumber === user.phoneNumber,
    );

    if (existingUserIndex >= 0) {
      this.activeUserPools[existingUserIndex] = user;
      return this.activeUserPools[existingUserIndex];
    }

    this.activeUserPools.push(user);
  }

  /**
   * @method removeUserFromActivePool
   * @description Removes a user from the active user pool based on their phone number.
   * @param {string} phoneNumber - The phone number of the user to be removed
   */
  removeUserFromActivePool(phoneNumber: string) {
    const index = this.activeUserPools.findIndex(
      (activeUser) => activeUser.phoneNumber === phoneNumber,
    );

    if (index !== -1) {
      return this.activeUserPools.splice(index, 1)[0];
    }
  }

  /**
   * @method checkUserExistInActivePool
   * @description Checks if a user exists in the active user pool based on their phone number.
   * @param {string} phoneNumber - The phone number of the user to check.
   */
  checkUserExistInActivePool(phoneNumber: string) {
    return this.activeUserPools.find(
      (activeUser) => activeUser.phoneNumber === phoneNumber,
    );
  }

  /**
   * @method addChatToUserMessageQueue
   * @description Adds a chat message to the user's message queue.
   * @param {string} phoneNumber - The phone number of the user whose message queue
   * @param {QueueNodeType} messageData - The chat message data to be added
   */
  addChatToUserMessageQueue(phoneNumber: string, messageData: QueueNodeType) {
    const userMessageQueue = this.getUserMessageQueue(phoneNumber);
    if (userMessageQueue) {
      userMessageQueue.enqueue(messageData);
    } else {
      const newMessageQueue = new MessageQueue(phoneNumber);
      newMessageQueue.enqueue(messageData);
      this.messageQueue.push(newMessageQueue);
    }
  }

  /**
   * @method getUserMessageQueue
   * @description Retrieves the message queue for a specific user based on their phone number.
   * @param {string} phoneNumber - The phone number of the user whose message queue
   */
  getUserMessageQueue(phoneNumber: string) {
    return this.messageQueue.find((queue) => queue.owner === phoneNumber);
  }

  /**
   * @method createRoom
   * @description Creates a new chat room with the provided details.
   * @param {CreateRoomDto} createRoomDto - The data transfer object containing room details.
   */
  async createRoom(createRoomDto: CreateRoomDto) {
    const userData = {
      ...createRoomDto,
      members: [createRoomDto.currentUserId, createRoomDto.otherUserId],
    };

    const createdRoom = new this.roomModel(userData);
    const room = await createdRoom.save();
    return room;
  }

  /**
   * @method findRoomById
   * @description Finds a room by its ID.
   * @param {string} roomId - The ID of the room to find.
   */
  async findRoomById(roomId: string) {
    return this.roomModel
      .findOne({ roomId })
      .populate({
        path: 'members',
        select: '-passcode -verificationCode -verificationCodeExpiresIn -__v',
      })
      .exec();
  }

  /**
   * @method getAllRoomsByUser
   * @description Retrieves all existing chat rooms from the database based on the currently logged in user.
   */
  async getAllRoomsByUser(userId: string) {
    const rooms = await this.roomModel
      .find({
        members: { $all: [userId] },
      })
      .populate({
        path: 'members',
        select: '-passcode -verificationCode -verificationCodeExpiresIn -__v',
      })
      .exec();

    return rooms;
  }

  /**
   * @method getAllRooms
   * @description Retrieves all chat rooms from the database.
   * @returns {Promise<RoomDocument[]>} - A promise that resolves to an array
   */
  async getAllRooms(): Promise<RoomDocument[]> {
    return this.roomModel
      .find()
      .populate({
        path: 'members',
        select: '-passcode -verificationCode -verificationCodeExpiresIn -__v',
      })
      .exec();
  }

  /**
   * @method createChat
   * @description Creates a new chat message in the specified room.
   * @param {CreateChatDto} CreateChatDto - The chat message to be created.
   */
  async createChat(createChatDto: CreateChatDto) {
    const chatData = {
      ...createChatDto,
      senderId: createChatDto.senderId,
      roomId: createChatDto.roomId,
    };

    const createdChat = new this.chatModel(chatData);
    const chat = await createdChat.save();
    return chat;
  }

  /**
   * @method findChatByRoomId
   * @description Finds all chat messages in a specific room by its ID.
   * @param {string} chatRoomId - The ID of the room to find chat messages in.
   * @returns {Promise<ChatDocument[]>} - A promise that resolves to an array of chat messages.
   */
  async findChatByRoomId(
    chatRoomId: string,
    // limit: number,
    // skip: number,
  ): Promise<ChatDocument[]> {
    const data = await this.chatModel
      .find({ chatRoomId })
      // .skip(skip)
      // .limit(limit)
      .populate('senderId')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .exec();

    return data;
    // const result = await this.chatModel.aggregate([
    //   {
    //     $match: {
    //       chatRoomId,
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: 'chats',
    //       localField: 'replyTo',
    //       foreignField: '_id',
    //       as: 'replyTo',
    //     },
    //   },

    //   {
    //     $unwind: {
    //       path: '$replyTo',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $sort: {
    //       createdAt: -1,
    //     },
    //   },
    //   {
    //     $facet: {
    //       data: [{ $skip: skip }, { $limit: limit }],
    //     },
    //   },
    // ]);

    // if (result && result.length > 0) {
    //   return result[0]?.data;
    // } else {
    //   return [];
    // }
  }

  /**
   * @method findChatById
   * @description Finds a chat message by its ID.
   * @param {string} chatId - The ID of the chat message to find.
   */
  async findChatById(chatId: string) {
    return this.chatModel.findById(chatId).populate('senderId').exec();
  }

  /**
   * @method updateLastMessageReadStatus
   * @description Updates the read status of the last message in a chat room.
   * @param {string} roomId - The ID of the room where the last message's read status needs to be updated.
   */
  async updateLastMessageReadStatus(roomId: string) {
    return await this.roomModel.updateOne(
      { roomId },
      { 'lastMessage.isRead': true },
      { new: true },
    );
  }

  /**
   * @method uploadFileOnCloud
   * @description Uploads a file to the cloudinary storage.
   * @param {Express.Multer.File} file - The data transfer object containing the file to be uploaded.
   */
  async uploadChatFile(file: Express.Multer.File) {
    return await this.fileUploadService.uploadFileToCloud(file.buffer);
  }

  /**
   * @method deleteUploadedFile
   * @description Deletes a file from the cloudinary storage.
   * @param {string} publicId - The public ID of the file to be deleted
   */

  async deleteChatFile(publicId: string) {
    await this.imageUploadQueue.addJob('file-delete', { publicId }, 1000);
  }
}
