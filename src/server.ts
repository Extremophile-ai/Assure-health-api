/* eslint-disable import/no-extraneous-dependencies */
import 'reflect-metadata';
import express, {
  Application, Request, Response, NextFunction
} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { ApiResponse } from '@/types/common.types';

// Load environment variables from appropriate file
const envFile = process.env.NODE_ENV === 'production' ? 'prod.env' : '.env';
console.log(`Loading environment from: ${envFile}`);
dotenv.config({ path: envFile });

// Validate required environment variables
const requiredEnvVars = ['JWT_KEY', 'SENDGRID_API_KEY', 'SENDGRID_EMAIL'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app: Application = express();
const port = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000']
    : process.env.ALLOWED_ORIGINS?.split(',') || ['https://assure-health.com'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

app.use(cors(corsOptions));

// Request logging middleware (development only)
if (isDevelopment) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
    });
    next();
  });
}

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

// Routes
app.use('/', router);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Assure Health API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: '/api',
  } as ApiResponse);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    message: 'The requested resource does not exist',
  } as ApiResponse);
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Validation error',
      message: error.message,
    } as ApiResponse);
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    } as ApiResponse);
  }

  // Default error response
  return res.status(500).json({
    success: false,
    status: 500,
    error: isProduction ? 'Internal server error' : error.message,
    message: 'Something went wrong on our end',
    ...(isDevelopment && { stack: error.stack }),
  } as ApiResponse);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (isProduction) {
    process.exit(1);
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Assure Health API server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
});

export default app;
export { server };
