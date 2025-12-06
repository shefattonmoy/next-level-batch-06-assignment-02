import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin only routes
router.get('/', authenticate, authorize('admin'), UserController.getAllUsers);
router.delete('/:userId', authenticate, authorize('admin'), UserController.deleteUser);

// Admin or own profile
router.put('/:userId', authenticate, UserController.updateUser);

// User profile
router.get('/profile', authenticate, UserController.getUserProfile);

export default router;