import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';



interface CallData {
  from: string;
  to: string;
  sdp?: any;
  candidate?: any;
}

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



    @SubscribeMessage('offer')
  sendOffer(@MessageBody() data: CallData) {
    const targetSocket = this.onlineUsers[data.to];
    if (targetSocket) {
      this.server.to(targetSocket).emit('offer', { from: data.from, sdp: data.sdp });
    }
  }

  @SubscribeMessage('answer')
  sendAnswer(@MessageBody() data: CallData) {
    const targetSocket = this.onlineUsers[data.to];
    if (targetSocket) {
      this.server.to(targetSocket).emit('answer', { from: data.from, sdp: data.sdp });
    }
  }

  @SubscribeMessage('ice-candidate')
  sendCandidate(@MessageBody() data: CallData) {
    const targetSocket = this.onlineUsers[data.to];
    if (targetSocket) {
      this.server.to(targetSocket).emit('ice-candidate', { from: data.from, candidate: data.candidate });
    }
  }

    @SubscribeMessage('end-call')
    endCall(
      @MessageBody() body: { roomId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const roomId = body.roomId;
      console.log(`Call ended in room: ${roomId}`);

      // Notify all users in that room
      this.server.to(roomId).emit('call-ended', { roomId });

      // Clean up active call records
      for (const [socketId, rId] of Object.entries(this.activeCalls)) {
        if (rId === roomId) delete this.activeCalls[socketId];
      }


      client.leave(roomId);

    }
    




  }
