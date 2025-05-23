import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room-schema';
import { CreateRoomDto } from './dto/create-room.dto';

/**
 * @class UsersService
 * @description Manages all user-related operations.
 * This includes creating users, verifying them, and finding users by their ID or verification code.
 */
@Injectable()
export class ChatService {
  users: { contactName: string; roomId: string; phoneNumber: string }[] = [];
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

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

  getRoomUsers(roomId: string) {
    return this.users.filter(
      (activeUser: {
        contactName: string;
        roomId: string;
        phoneNumber: string;
      }) => activeUser.roomId === roomId,
    );
  }

  getCurrentUserByPhoneNumber(phoneNumber: string) {
    return this.users.find(
      (activeUser: {
        contactName: string;
        roomId: string;
        phoneNumber: string;
      }) => activeUser.phoneNumber === phoneNumber,
    );
  }

  getCurrentActiveRoom(roomId: string) {
    return this.users.find(
      (activeUser: { roomId: string }) => activeUser.roomId === roomId,
    );
  }

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
   * @method createRoom
   */
  async createRoom(createRoomDto: CreateRoomDto) {
    const createdRoom = new this.roomModel({
      ...createRoomDto,
    });
    const room = await createdRoom.save();
    return room;
  }

  async findRoomById(roomId: string) {
    return this.roomModel.findOne({ roomId }).populate('members').exec();
  }
}
