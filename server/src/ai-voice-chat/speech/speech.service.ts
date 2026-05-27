import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

@Injectable()
export class DeepgramService implements OnModuleInit {
  private deepgram: any;
  public connections: Record<number, any> = {};

  onModuleInit() {
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  }

  createConnection(userId: number, onTranscript: (text: string) => void) {
    const connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      encoding: 'linear16',
      sample_rate: 16000, // SHOULD BE MATCH WITH FRONTEND
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log(` Deepgram connected: ${userId}`);
      connection.isReady = true;
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      console.log("RAW:", JSON.stringify(data));

      const text = data.channel?.alternatives[0]?.transcript;

      if (text && text.trim() !== '') {
        console.log('Transcript:', text);
        onTranscript(text);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error(' Deepgram error:', err);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log(` Deepgram closed: ${userId}`);
    });

    this.connections[userId] = connection;
  }

  sendAudio(userId: number, buffer: Buffer) {
    const conn = this.connections[userId];

    if (!conn) {
      console.log(" No DG connection");
      return;
    }

    if (!conn.isReady) {
      console.log(" DG not ready yet");
      return;
    }

    console.log(" Sending audio:", buffer.length);

    conn.send(buffer);
  }

  close(userId: number) {
    this.connections[userId]?.finish();
    delete this.connections[userId];
  }
}