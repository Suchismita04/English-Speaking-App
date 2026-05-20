import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";
import * as fs from "fs";

@Injectable()
export class SpeechService {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async speechToText(filePath: string): Promise<string> {
    const response = await this.groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3",
    });

    return response.text;
  }
}