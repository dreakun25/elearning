import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/auth/signup', userController.signup);
router.post('/auth/login', userController.login);

router.get('/users/me', authenticate, userController.getMe);
router.patch('/users/me', authenticate, userController.updateMe);

router.get('/users/:id', userController.getUserById);

export default router;
