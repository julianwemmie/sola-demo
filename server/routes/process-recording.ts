import { Router } from 'express';
import multer from 'multer';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extractAudio } from '../lib/ffmpeg.js';
import { transcribe } from '../lib/whisper.js';
import { proposeChanges } from '../lib/claude.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

export const processRecordingRouter = Router();

processRecordingRouter.post('/process-recording', upload.single('recording'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No recording file provided' });
    return;
  }

  const id = randomUUID();
  const webmPath = join(tmpdir(), `recording-${id}.webm`);
  const audioPath = join(tmpdir(), `recording-${id}.mp3`);

  try {
    // 1. Write webm to temp file
    await writeFile(webmPath, file.buffer);
    console.log(`[${id}] Saved webm (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

    // 2. Extract audio with ffmpeg
    await extractAudio(webmPath, audioPath);
    console.log(`[${id}] Extracted audio`);

    // 3. Transcribe with Whisper
    const transcript = await transcribe(audioPath);
    console.log(`[${id}] Transcribed: "${transcript.slice(0, 100)}..."`);

    // 4. Get the current workflow nodes from the request body (sent as JSON alongside the file)
    // The frontend sends the current nodes as a separate field
    const currentNodes = req.body?.currentNodes ? JSON.parse(req.body.currentNodes) : [];

    // 5. Propose changes with Claude
    const result = await proposeChanges(transcript, currentNodes);
    console.log(`[${id}] Proposed ${result.modifications.length} changes`);

    res.json(result);
  } catch (err) {
    console.error(`[${id}] Error:`, err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Processing failed' });
  } finally {
    // Cleanup temp files
    await unlink(webmPath).catch(() => {});
    await unlink(audioPath).catch(() => {});
  }
});
