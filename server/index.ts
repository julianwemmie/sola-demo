import express from 'express';
import ViteExpress from 'vite-express';
import { processRecordingRouter } from './routes/process-recording.js';

const app = express();

app.use('/api', processRecordingRouter);

const port = parseInt(process.env.PORT || '3000', 10);

ViteExpress.listen(app, port, () => {
  const url = process.env.SERVER_URL || `http://localhost:${port}`;
  console.log(`Server listening on ${url}`);
});
