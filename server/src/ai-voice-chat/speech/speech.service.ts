import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";
import * as fs from "fs";

@Injectable()
export class SpeechService {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async speechToText(buffer: Buffer): Promise<string> {

    const tempFilePath= `/uploads/temp-${Date.now()}.mp3`
    await fs.promises.writeFile(tempFilePath,buffer)
    const response = await this.groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
    });


//for clean up file 
    fs.unlinkSync(tempFilePath)

    return response.text;
  }
}