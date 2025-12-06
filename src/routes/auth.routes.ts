import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/signup', validateRegister, AuthController.register);
router.post('/signin', validateLogin, AuthController.login);

export default router;