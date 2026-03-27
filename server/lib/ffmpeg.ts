import ffmpeg from 'fluent-ffmpeg';

export function extractAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .audioChannels(1)
      .audioFrequency(16000)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(new Error(`ffmpeg error: ${err.message}`)))
      .run();
  });
}
