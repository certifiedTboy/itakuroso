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
import { formatPhoneNumber } from '../helpers/chat-helpers';

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
    // console.log(data);
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

    const formatedPhoneNumber = formatPhoneNumber(userId.phoneNumber);

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
      this.server.to(roomId).emit('message', {
        message: `Kinly invite ${userId.contactName} to create an account with his phone number: ${userId.phoneNumber} to join the chat`,
      });
    }

    // check if room already exist on database
    const roomExist = await this.chatService.findRoomById(roomId);

    const currentUser = await this.usersService.checkIfUserExist({
      phoneNumber: currentUserId.phoneNumber,
    });

    if (!roomExist) {
      /**
       * create a new room for the user
       */

      await this.chatService.createRoom({
        roomId,
        currentUserId: currentUser!._id!.toString(),
        otherUserId: userWithPhoneExist!._id!.toString(),
        roomName: '',
        roomLink: '',
        roomImage: '',
      });
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: { roomId: string; sender: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Message received:', data);
    // Emit to all clients
    this.server.emit('message', data);
  }
}
