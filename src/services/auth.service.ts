import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { User, RegisterRequest, AuthRequest, JwtPayload, ApiResponse } from '../types';
import { Logger } from '../utils/logger';

export class AuthService {
  static async register(userData: RegisterRequest): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      const user = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role || 'customer'
      });

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'User registered successfully',
        data: userWithoutPassword
      };
    } catch (error) {
      Logger.error('Registration failed', error);
      return {
        success: false,
        message: 'Registration failed',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async login(loginData: AuthRequest): Promise<ApiResponse<{ token: string; user: Omit<User, 'password'> }>> {
    try {
      const user = await UserModel.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      const isValidPassword = await UserModel.comparePassword(loginData.email, loginData.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET || 'your_default_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userWithoutPassword
        }
      };
    } catch (error) {
      Logger.error('Login failed', error);
      return {
        success: false,
        message: 'Login failed',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}