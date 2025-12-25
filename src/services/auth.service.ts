import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { User, RegisterRequest, AuthRequest, JwtPayload, ApiResponse } from '../types';
import { Logger } from '../utils/logger';

export class AuthService {
  static async register(userData: RegisterRequest): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      const normalizedEmail = userData.email.toLowerCase();
      
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      const user = await UserModel.create({
        name: userData.name,
        email: normalizedEmail,
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
      const normalizedEmail = loginData.email.toLowerCase();
      
      const user = await UserModel.findByEmail(normalizedEmail);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      const isValidPassword = await UserModel.comparePassword(normalizedEmail, loginData.password);
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

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const expiresIn: any | number = process.env.JWT_EXPIRES_IN || '7d';
      
      // Fixed jwt.sign call
      const signOptions: jwt.SignOptions = {
        expiresIn
      };
      
      const token = jwt.sign(jwtPayload, jwtSecret, signOptions);

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