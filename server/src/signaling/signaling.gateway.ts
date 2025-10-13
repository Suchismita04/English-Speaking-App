import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SignalingGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { roomId: string; offer: any }) {
    client.to(payload.roomId).emit('offer', payload.offer);
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { roomId: string; answer: any }) {
    client.to(payload.roomId).emit('answer', payload.answer);
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(client: Socket, payload: { roomId: string; candidate: any }) {
    client.to(payload.roomId).emit('iceCandidate', payload.candidate);
  }
}
