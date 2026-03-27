import express from 'express';
import ViteExpress from 'vite-express';
import { processRecordingRouter } from './routes/process-recording.js';
import { visitRouter } from './routes/visit.js';

const app = express();

app.use('/api', processRecordingRouter);
app.use('/api', visitRouter);

const port = parseInt(process.env.PORT || '3000', 10);

ViteExpress.listen(app, port, () => {
  const url = process.env.SERVER_URL || `http://localhost:${port}`;
  console.log(`Server listening on ${url}`);
});
