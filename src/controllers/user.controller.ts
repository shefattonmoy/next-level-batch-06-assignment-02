import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    const result = await UserService.getAllUsers();
    return res.status(200).json(result);
  }

  static async updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.userId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const result = await UserService.updateUser(
      id,
      req.body,
      req.user?.role || 'customer',
      req.user?.userId || 0
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      const status = result.message.includes('not found') ? 404 :
        result.message.includes('cannot') ? 403 : 400;
      return res.status(status).json(result);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.userId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const result = await UserService.deleteUser(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      const status = result.message.includes('not found') ? 404 : 400;
      return res.status(status).json(result);
    }
  }

  static async getUserProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await UserService.getUserById(req.user.userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  }
}