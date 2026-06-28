import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TtsService {
  async textToSpeech(text: string): Promise<Buffer> {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
      {
        text,
        model_id: 'eleven_turbo_v2',
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );
   //convert the audio into base64
    return Buffer.from(response.data)
  }
}