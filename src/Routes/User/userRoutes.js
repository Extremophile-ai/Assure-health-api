import { Router } from 'express';
import UserController from '../../controllers/users/User';
import Authentication from '../../middleware/auth';

const router = Router();

const { authenticate } = Authentication;
const {
  userSignup, verifyUser, userSignin, update, removeUser, addHealthPlan, getAllUsers
} = UserController;

router.post('/user/signup', userSignup);
router.post('/user/login', userSignin);
router.get('/users', getAllUsers);
router.get('/user/verify_mail/:email', verifyUser);
router.patch('/user/update', authenticate, update);
router.patch('/user/update/health_plan', authenticate, addHealthPlan);
router.delete('/user/delete', authenticate, removeUser);

export default router;
