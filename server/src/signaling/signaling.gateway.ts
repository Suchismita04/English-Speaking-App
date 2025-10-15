import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


// signaling gatewaye
@WebSocketGateway({ cors: true })
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // All online users: socketId -> userId
  onlineUsers: { [socketId: string]: string } = {};

  // Users currently in a call (socketId -> roomId)
  activeCalls: { [socketId: string]: string } = {};

  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.onlineUsers[client.id];
    console.log(`User disconnected: ${userId} (${client.id})`);

    delete this.onlineUsers[client.id];
    delete this.activeCalls[client.id];
  }

  // Register a user as online
  @SubscribeMessage('register-user')
  registerUser(
    @MessageBody() body: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.onlineUsers[client.id] = body.userId;
    console.log(`User registered: ${body.userId} (${client.id})`);
    client.emit('registration-successful', {
      status: 'OK',
      userId: body.userId,
      message: `Successfully registered ${body.userId}`,
    });


  }

  

  
}
