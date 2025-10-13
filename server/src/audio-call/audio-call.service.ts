import { Injectable } from '@nestjs/common';
import { SignalingGateway } from 'src/signaling/signaling.gateway';
import { randomUUID } from 'crypto';

interface WaitingUser {
  userId: string;
  socketId: string;
}

@Injectable()
export class AudioCallService {
  private waitingUsers: WaitingUser[] = [];
  private activeCalls: { [roomId: string]: string[] } = {};

  constructor(private readonly signalingGateway: SignalingGateway) {}

  // Called when user starts an audio call
  startCall(userId: string, socketId: string) {
    // If no waiting user, add to queue
    if (this.waitingUsers.length === 0) {
      this.waitingUsers.push({ userId, socketId });
      return { message: 'Waiting for a partner...' };
    }

    // Pick the first waiting user (oldest one in queue)
    const partner = this.waitingUsers.shift();

    // Safety check
    if (!partner) {
      // Should never happen, but just in case of concurrency
      this.waitingUsers.push({ userId, socketId });
      return { message: 'Waiting for a partner...' };
    }

    const roomId = randomUUID();
    this.activeCalls[roomId] = [socketId, partner.socketId];

    // Notify both users via socket (SignalingGateway)
    this.signalingGateway.server.to(partner.socketId).emit('partner-found', {
      roomId,
      partnerId: userId,
    });

    this.signalingGateway.server.to(socketId).emit('partner-found', {
      roomId,
      partnerId: partner.userId,
    });

    return { message: 'Partner found', roomId };
  }

  // End call or user disconnect
  endCall(roomId: string) {
    delete this.activeCalls[roomId];
  }
}
