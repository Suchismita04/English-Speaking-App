import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";
import * as fs from "fs";
import * as path from "path";
import ffmpeg = require("fluent-ffmpeg");

// FORCE FFmpeg path
ffmpeg.setFfmpegPath("C://ffmpeg//bin//ffmpeg.exe");

@Injectable()
export class SpeechService {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async speechToText(buffer: Buffer): Promise<string> {
    const id = Date.now();

    const inputPath = path.join(
      "E:/English Speaking App/server/uploads",
      `temp-${id}.webm`
    );

    const outputPath = path.join(
      "E:/English Speaking App/server/uploads",
      `temp-${id}.wav`
    );

    await fs.promises.writeFile(inputPath, buffer);
    console.log("Saved input:", inputPath);

    await this.convertToWav(inputPath, outputPath);

    const response = await this.groq.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-large-v3",
    });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return response.text;
  }

  private convertToWav(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .audioCodec("pcm_s16le")
        .format("wav")
        .on("start", (cmd) => console.log("FFmpeg command:", cmd))
        .on("end", () => {
          console.log("Conversion done");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .save(output);
    });
  }
}