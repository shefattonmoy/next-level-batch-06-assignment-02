import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, AuthRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    const userData: RegisterRequest = req.body;
    const result = await AuthService.register(userData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  }

  static async login(req: Request, res: Response) {
    const loginData: AuthRequest = req.body;
    const result = await AuthService.login(loginData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  }
}