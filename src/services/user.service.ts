import { UserModel } from '../models/user.model';
import { User, ApiResponse } from '../types';
import { Logger } from '../utils/logger';

export class UserService {
  static async getAllUsers(): Promise<ApiResponse<Omit<User, 'password'>[]>> {
    try {
      const users = await UserModel.findAll();
      
      return {
        success: true,
        message: users.length > 0 ? 'Users retrieved successfully' : 'No users found',
        data: users
      };
    } catch (error) {
      Logger.error('Failed to get users', error);
      return {
        success: false,
        message: 'Failed to retrieve users',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getUserById(id: number): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user
      };
    } catch (error) {
      Logger.error('Failed to get user', error);
      return {
        success: false,
        message: 'Failed to retrieve user',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateUser(id: number, updateData: Partial<Omit<User, 'id' | 'password' | 'created_at' | 'updated_at'>>, requesterRole: string, requesterId: number): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (requesterRole !== 'admin' && requesterId !== id) {
        return {
          success: false,
          message: 'You can only update your own profile'
        };
      }

      if (requesterRole !== 'admin' && updateData.role && updateData.role !== existingUser.role) {
        return {
          success: false,
          message: 'You cannot change your role'
        };
      }

      if (updateData.email && updateData.email !== existingUser.email) {
        const userWithEmail = await UserModel.findByEmail(updateData.email);
        if (userWithEmail && userWithEmail.id !== id) {
          return {
            success: false,
            message: 'Email already in use'
          };
        }
      }

      const updatedUser = await UserModel.update(id, updateData);
      
      if (!updatedUser) {
        return {
          success: false,
          message: 'Failed to update user'
        };
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      Logger.error('Failed to update user', error);
      return {
        success: false,
        message: 'Failed to update user',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const hasActiveBookings = await UserModel.hasActiveBookings(id);
      if (hasActiveBookings) {
        return {
          success: false,
          message: 'Cannot delete user with active bookings'
        };
      }

      const deleted = await UserModel.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete user'
        };
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      Logger.error('Failed to delete user', error);
      return {
        success: false,
        message: 'Failed to delete user',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}