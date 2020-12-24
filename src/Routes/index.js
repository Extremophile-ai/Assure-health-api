import { Router } from 'express';
import userRoutes from './User/userRoutes';

const router = new Router();

router.use('/', userRoutes);

export default router;
