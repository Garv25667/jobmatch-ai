import express from 'express';
import cors from 'cors';
import { PORT } from './config/env';
import jobsRouter from './routes/jobs';
import matchRouter from './routes/match';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/jobs', jobsRouter);
app.use('/match', matchRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'jobmatch-backend' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
