import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat-services';
import { UsersService } from 'src/user/users-service';
import { ChatHelpers } from '../helpers/chat-helpers';
import { ChatDocument } from './schemas/chat-schema';

@WebSocketGateway({
  cors: {
    origin: '*', // or your frontend URL
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody()
    data: {
      roomId: string;
      currentUserId: { phoneNumber: string; email: string };
      userId: { phoneNumber: string; contactName: string };
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, currentUserId } = data;

    // let newRoomId: string;

    // if (!roomId) {
    //   newRoomId = ChatHelpers.generateRoomId();
    // } else {
    //   newRoomId = roomId;
    // }

    // /**
    //  * add current user to temporary room
    //  */
    const user = this.chatService.userJoin({
      contactName: currentUserId.email,
      roomId,
      phoneNumber: currentUserId.phoneNumber,
    });

    await client.join(user.roomId);

    const formatedPhoneNumber = ChatHelpers.formatPhoneNumber(
      userId.phoneNumber,
    );

    /**
     * check if the user with the phone number is a registered user
     */
    const userWithPhoneExist = await this.usersService.checkIfUserExist({
      phoneNumber: formatedPhoneNumber,
    });

    if (!userWithPhoneExist) {
      /**
       * probably create a temporary account for the user
       * and send a sms containing a prompt for the user to create an account
       * and send the user a verification code
       */
      /**
       * for now, the active user will get a message to inform the other user to create an account
       */
      return this.server
        .to(user.roomId)
        .emit(
          'message',
          ChatHelpers.messageResponse(
            `Kindly invite ${userId.contactName} to create an account with his phone number: ${userId.phoneNumber} to join the chat`,
            ' ',
            roomId,
          ),
        );
    }

    // check if room already exist on database
    const roomExist = await this.chatService.findRoomById(user.roomId);

    /**
     * check if current user with phone number exist on database
     */
    // Define a type for the user object returned by checkIfUserExist
    type User = { _id?: string; [key: string]: any };

    const currentUser = (await this.usersService.checkIfUserExist({
      phoneNumber: currentUserId.phoneNumber,
    })) as User | null;

    if (!roomExist) {
      /**
       * create a new room for the user
       */

      await this.chatService.createRoom({
        roomId,
        currentUserId:
          currentUser && currentUser._id ? String(currentUser._id) : '',
        otherUserId:
          userWithPhoneExist && (userWithPhoneExist as User)._id
            ? String((userWithPhoneExist as User)._id)
            : '',
        roomName: '',
        roomLink: '',
        roomImage: '',
      });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      content: string;
      file?: string;
      messageToReplyId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    let replyToMessage: ChatDocument | null = null;

    const user = this.chatService.getCurrentActiveRoom(roomId);

    // Check if there are morethan one active user in the room
    const currentActiveUsers = this.chatService.getRoomUsers(roomId);

    if (user) {
      const roomExist = await this.chatService.findRoomById(roomId);
      /**
       * save the message to the database
       */
      if (roomExist) {
        await this.chatService.createChat({
          roomId: roomExist._id.toString(),
          senderId: data.senderId,
          chatRoomId: roomExist.roomId,
          message: data.content,
          file: data?.file,
          replyTo: data?.messageToReplyId,
        });

        roomExist.lastMessage = {
          content: data.content,
          senderId: data.senderId,
          timestamp: new Date(),
          isRead: currentActiveUsers.length === 1 ? false : true,
          containsFile: !!data.file,
        };

        if (data.messageToReplyId) {
          replyToMessage = await this.chatService.findChatById(
            data.messageToReplyId,
          );
        }
        await roomExist.save();
      }

      return this.server.to(user?.roomId).emit(
        'message',
        ChatHelpers.messageResponse(
          data.content,
          data.senderId,
          roomId,
          data.file,
          {
            replyToId: replyToMessage?._id.toString() || '',
            replyToMessage: replyToMessage?.message || '',
          },
        ),
      );
    }
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    await this.chatService.updateLastMessageReadStatus(roomId);

    return this.server.to(roomId).emit('markMessageAsRead', {});
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody()
    data: {
      // roomId: string;
      currentUserId: { phoneNumber: string };
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { currentUserId } = data;

    /**
     * remove current user from the room
     */
    this.chatService.userLeave(currentUserId.phoneNumber);
  }
}
