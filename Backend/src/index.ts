import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      health: '/api/health'
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