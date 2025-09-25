import { Router } from 'express';
import UserController from '@/controllers/users/User';
import Authentication from '@/middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/user/signup', UserController.userSignup);
router.post('/user/login', UserController.userSignin);
router.get('/user/verify_mail/:email', UserController.verifyUser);

// Admin-only routes (should be protected with role-based auth)
router.get('/users', 
  Authentication.authenticate,
  Authentication.authorize(['Super Admin', 'Admin']),
  UserController.getAllUsers
);

// Protected routes (authentication required)
router.patch('/user/update', 
  Authentication.authenticate, 
  UserController.update
);

router.patch('/user/update/health_plan', 
  Authentication.authenticate, 
  UserController.addHealthPlan
);

router.delete('/user/delete', 
  Authentication.authenticate, 
  UserController.removeUser
);

export default router;