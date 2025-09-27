import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resumeRouter from './routes/resume';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('- ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length || 0);

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/resume', resumeRouter);

// Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Default route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'AI Interviewer API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      resume: '/api/resume/extract-info'
    }
  });
});

// Error handling middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at http://localhost:${PORT}/api/health`);
});