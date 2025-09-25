import { Router } from 'express';
import userRoutes from './user/userRoutes';

const router = Router();

// API routes
router.use('/', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API info endpoint
router.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Assure Health API',
    version: '1.0.0',
    documentation: '/api/docs', // Future endpoint for API docs
    endpoints: {
      auth: [
        'POST /user/signup',
        'POST /user/login',
        'GET /user/verify_mail/:email',
      ],
      users: [
        'PATCH /user/update',
        'PATCH /user/update/health_plan',
        'DELETE /user/delete',
        'GET /users', // Admin only
      ],
      system: [
        'GET /health',
        'GET /api',
      ]
    }
  });
});

export default router;
