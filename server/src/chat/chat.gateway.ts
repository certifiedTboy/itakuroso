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
import { MessageStatus } from './chat-type';
// import { ChatDocument } from './schemas/chat-schema';

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
      return this.server.to(user.roomId).emit(
        'message',
        ChatHelpers.messageResponse(
          `Kindly invite ${userId.contactName} to create an account with his phone number: ${userId.phoneNumber} to join the chat`,
          ' ',

          roomId,
          MessageStatus.READ,
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

  /**
   * @method handleUserOnline
   * @description Handles listening event when a user comes online.
   * @param {Object} currentUserData - The data of the current user.
   * @param {Socket} client - The connected socket of the user.
   */
  @SubscribeMessage('userOnline')
  async handleUserOnline(
    @MessageBody()
    currentUserData: { _id: string; phoneNumber: string; email: string },
    // @ConnectedSocket() client: Socket,
  ) {
    /**
     * add current user to active user pool
     */
    this.chatService.addUserToActivePool({
      contactName: currentUserData.email,
      phoneNumber: currentUserData.phoneNumber,
    });

    /**
     * update the user online status
     */

    await this.usersService.updateUserOnlineStatus(currentUserData._id);
  }

  /**
   * @method handleUserOffline
   * @description Handles listening event when a user goes offline.
   * @param {Object} currentUserData - The data of the current user.
   * @param {Socket} client - The connected socket of the user.
   */
  @SubscribeMessage('userOffline')
  async handleUserOffline(
    @MessageBody()
    currentUserData: { _id: string; phoneNumber: string; email: string },
    // @ConnectedSocket() client: Socket,
  ) {
    /**
     * remove current user from active user pool
     */
    this.chatService.removeUserFromActivePool(currentUserData.phoneNumber);

    /**
     * update the user offline status on database
     */
    await this.usersService.updateUserOfflineStatus(currentUserData._id);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      content: string;
      file?: string;
      replyTo?: {
        replyToId: string;
        replyToMessage: string;
        replyToSenderId: string;
      } | null;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    // let replyToMessage: ChatDocument | null = null;

    const user = this.chatService.getCurrentActiveRoom(roomId);

    // Check if there are morethan one active user in the room
    // ill use this to set up messsage queue
    // const currentActiveUsers = this.chatService.getRoomUsers(roomId);

    if (user) {
      // const roomExist = await this.chatService.findRoomById(roomId);
      /**
       * save the message to the database
       */
      // if (roomExist) {
      // await this.chatService.createChat({
      //   roomId: roomExist._id.toString(),
      //   senderId: data.senderId,
      //   chatRoomId: roomExist.roomId,
      //   message: data.content,
      //   file: data?.file,
      //   replyTo: data?.messageToReplyId,
      // });
      // roomExist.lastMessage = {
      //   content: data.content,
      //   senderId: data.senderId,
      //   timestamp: new Date(),
      //   isRead: currentActiveUsers.length === 1 ? false : true,
      //   containsFile: !!data.file,
      // };
      // if (data.messageToReplyId) {
      //   replyToMessage = await this.chatService.findChatById(
      //     data.messageToReplyId,
      //   );
      // }
      // await roomExist.save();
      // }

      const userIsOnlineAndActive = this.chatService.checkUserExistInActivePool(
        user?.phoneNumber,
      );

      if (userIsOnlineAndActive) {
        return this.server.to(user?.roomId).emit(
          'message',
          ChatHelpers.messageResponse(
            data.content,
            data.senderId,
            ChatHelpers.generateRoomId(),
            MessageStatus.DELIVERED,
            user?.roomId,
            data.file,
            data.replyTo && data?.replyTo?.replyToMessage
              ? {
                  replyToId: data.replyTo.replyToId,
                  replyToMessage: data.replyTo.replyToMessage,
                  replyToSenderId: data.replyTo.replyToSenderId,
                }
              : undefined,
          ),
        );
      }

      return this.server.to(user?.roomId).emit(
        'message',
        ChatHelpers.messageResponse(
          data.content,
          data.senderId,
          ChatHelpers.generateRoomId(),
          MessageStatus.SENT,
          user?.roomId,
          data.file,
          data.replyTo && data?.replyTo?.replyToMessage
            ? {
                replyToId: data.replyTo.replyToId,
                replyToMessage: data.replyTo.replyToMessage,
                replyToSenderId: data.replyTo.replyToSenderId,
              }
            : undefined,
        ),
      );
    }
  }

  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody() data: { roomId: string },
    // @ConnectedSocket() client: Socket,
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
    // @ConnectedSocket() client: Socket,
  ) {
    const { currentUserId } = data;

    /**
     * remove current user from the room
     */
    this.chatService.userLeave(currentUserId.phoneNumber);
  }
}
