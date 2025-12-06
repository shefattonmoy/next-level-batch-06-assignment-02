import { VehicleModel } from '../models/vehicle.model';
import { Vehicle, ApiResponse } from '../types';
import { Logger } from '../utils/logger';

export class VehicleService {
  static async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Vehicle>> {
    try {
      const existingVehicle = await VehicleModel.findByRegistration(vehicleData.registration_number);
      if (existingVehicle) {
        return {
          success: false,
          message: 'Vehicle with this registration number already exists'
        };
      }

      const vehicle = await VehicleModel.create(vehicleData);

      return {
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      };
    } catch (error) {
      Logger.error('Failed to create vehicle', error);
      return {
        success: false,
        message: 'Failed to create vehicle',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await VehicleModel.findAll();

      return {
        success: true,
        message: vehicles.length > 0 ? 'Vehicles retrieved successfully' : 'No vehicles found',
        data: vehicles
      };
    } catch (error) {
      Logger.error('Failed to get vehicles', error);
      return {
        success: false,
        message: 'Failed to retrieve vehicles',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
    try {
      const vehicle = await VehicleModel.findById(id);

      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      return {
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle
      };
    } catch (error) {
      Logger.error('Failed to get vehicle', error);
      return {
        success: false,
        message: 'Failed to retrieve vehicle',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateVehicle(id: number, updateData: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Vehicle>> {
    try {
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      if (updateData.registration_number && updateData.registration_number !== existingVehicle.registration_number) {
        const vehicleWithRegistration = await VehicleModel.findByRegistration(updateData.registration_number);
        if (vehicleWithRegistration) {
          return {
            success: false,
            message: 'Registration number already in use'
          };
        }
      }

      const updatedVehicle = await VehicleModel.update(id, updateData);

      if (!updatedVehicle) {
        return {
          success: false,
          message: 'Failed to update vehicle'
        };
      }

      return {
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      };
    } catch (error) {
      Logger.error('Failed to update vehicle', error);
      return {
        success: false,
        message: 'Failed to update vehicle',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deleteVehicle(id: number): Promise<ApiResponse> {
    try {
      const vehicle = await VehicleModel.findById(id);
      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      const hasActiveBookings = await VehicleModel.hasActiveBookings(id);
      if (hasActiveBookings) {
        return {
          success: false,
          message: 'Cannot delete vehicle with active bookings'
        };
      }

      const deleted = await VehicleModel.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete vehicle'
        };
      }

      return {
        success: true,
        message: 'Vehicle deleted successfully'
      };
    } catch (error) {
      Logger.error('Failed to delete vehicle', error);
      return {
        success: false,
        message: 'Failed to delete vehicle',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAvailableVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await VehicleModel.findAvailable();

      return {
        success: true,
        message: vehicles.length > 0 ? 'Available vehicles retrieved successfully' : 'No available vehicles found',
        data: vehicles
      };
    } catch (error) {
      Logger.error('Failed to get available vehicles', error);
      return {
        success: false,
        message: 'Failed to retrieve available vehicles',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}