import OpenAI from 'openai';
import { createReadStream } from 'fs';

let _openai: OpenAI | null = null;
function getClient() {
  if (!_openai) _openai = new OpenAI();
  return _openai;
}

export async function transcribe(audioPath: string): Promise<string> {
  const response = await getClient().audio.transcriptions.create({
    model: 'whisper-1',
    file: createReadStream(audioPath),
    language: 'en',
  });

  return response.text;
}
