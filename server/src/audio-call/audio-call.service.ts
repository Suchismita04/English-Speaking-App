import { Injectable } from '@nestjs/common';
import { SignalingGateway } from 'src/signaling/signaling.gateway';
import { randomUUID } from 'crypto';

// audio call service
@Injectable()
export class AudioCallService {
  constructor(private readonly signalingGateway: SignalingGateway) {}

  startCall(userId: string, socketId: string) {

    const availableSockets = Object.keys(this.signalingGateway.onlineUsers)
      .filter(id => id !== socketId && !this.signalingGateway.activeCalls[id]);

    if (availableSockets.length === 0) {
      return { message: 'No online users available' };
    }

    // Pick a random partner
    const partnerSocketId = availableSockets[Math.floor(Math.random() * availableSockets.length)];
    const partnerId = this.signalingGateway.onlineUsers[partnerSocketId];

    // Generate roomId
    const roomId = randomUUID();

    // Mark both users as in-call
    this.signalingGateway.activeCalls[socketId] = roomId;
    this.signalingGateway.activeCalls[partnerSocketId] = roomId;

    // Emit events to both users
    this.signalingGateway.server.to(partnerSocketId).emit('partner-found', {
      roomId,
      partnerId: userId,
    });

    this.signalingGateway.server.to(socketId).emit('partner-found', {
      roomId,
      partnerId,
    });

    return { message: 'Partner found', roomId };
  }

  endCall(socketId: string) {
  const roomId = this.signalingGateway.activeCalls[socketId];
  if (!roomId) return;

  // Notify all users in the room that the call ended
  this.signalingGateway.server.to(roomId).emit('call-ended', { roomId });

  // Remove all participants from activeCalls and leave room
  Object.keys(this.signalingGateway.activeCalls).forEach(sid => {
    if (this.signalingGateway.activeCalls[sid] === roomId) {
      delete this.signalingGateway.activeCalls[sid];
      const socket = this.signalingGateway.server.sockets.sockets.get(sid);
      if (socket) socket.leave(roomId);
    }
  });
}

}
``
