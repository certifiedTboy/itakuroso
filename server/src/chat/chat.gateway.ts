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

@WebSocketGateway({
  cors: {
    origin: '*', // or your frontend URL
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
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

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { sender: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Message received:', data);
    // Emit to all clients
    this.server.emit('message', data);
  }
}
