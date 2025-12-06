import { BookingModel } from '../models/booking.model';
import { VehicleModel } from '../models/vehicle.model';
import { UserModel } from '../models/user.model';
import { Booking, ApiResponse } from '../types';
import { Logger } from '../utils/logger';

export class BookingService {
  static async createBooking(bookingData: Omit<Booking, 'id' | 'total_price' | 'status' | 'created_at' | 'updated_at'>, customerId: number, userRole: string): Promise<ApiResponse<Booking>> {
    try {
      const user = await UserModel.findById(bookingData.customer_id);
      if (!user) {
        return {
          success: false,
          message: 'Customer not found'
        };
      }

      const vehicle = await VehicleModel.findById(bookingData.vehicle_id);
      if (!vehicle) {
        return {
          success: false,
          message: 'Vehicle not found'
        };
      }

      if (vehicle.availability_status !== 'available') {
        return {
          success: false,
          message: 'Vehicle is not available for booking'
        };
      }

      const isAvailable = await BookingModel.checkVehicleAvailability(
        bookingData.vehicle_id,
        new Date(bookingData.rent_start_date),
        new Date(bookingData.rent_end_date)
      );

      if (!isAvailable) {
        return {
          success: false,
          message: 'Vehicle is already booked for the selected dates'
        };
      }

      const totalPrice = await BookingModel.calculatePrice(
        bookingData.vehicle_id,
        bookingData.rent_start_date.toString(),
        bookingData.rent_end_date.toString()
      );

      const booking = await BookingModel.create({
        ...bookingData,
        total_price: totalPrice,
        status: 'active'
      });

      await VehicleModel.updateAvailability(bookingData.vehicle_id, 'booked');

      const vehicleDetails = await VehicleModel.findById(bookingData.vehicle_id);

      return {
        success: true,
        message: 'Booking created successfully',
        data: {
          ...booking,
          vehicle: vehicleDetails ? {
            vehicle_name: vehicleDetails.vehicle_name,
            daily_rent_price: vehicleDetails.daily_rent_price
          } : undefined
        } as any
      };
    } catch (error) {
      Logger.error('Failed to create booking', error);
      return {
        success: false,
        message: 'Failed to create booking',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAllBookings(userRole: string, userId?: number): Promise<ApiResponse<Booking[]>> {
    try {
      let bookings: Booking[] = [];

      if (userRole === 'admin') {
        bookings = await BookingModel.findAll();
      } else if (userId) {
        bookings = await BookingModel.findByCustomer(userId);
      } else {
        return {
          success: false,
          message: 'User ID is required for customer access'
        };
      }

      return {
        success: true,
        message: bookings.length > 0
          ? 'Bookings retrieved successfully'
          : userRole === 'admin'
            ? 'No bookings found'
            : 'No bookings found for your account',
        data: bookings
      };
    } catch (error) {
      Logger.error('Failed to get bookings', error);
      return {
        success: false,
        message: 'Failed to retrieve bookings',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateBooking(id: number, updateData: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>, userRole: string, userId: number): Promise<ApiResponse<Booking>> {
    try {
      const existingBooking = await BookingModel.findById(id);
      if (!existingBooking) {
        return {
          success: false,
          message: 'Booking not found'
        };
      }

      if (userRole !== 'admin' && existingBooking.customer_id !== userId) {
        return {
          success: false,
          message: 'You can only update your own bookings'
        };
      }

      if (updateData.status) {
        const today = new Date();
        const startDate = new Date(existingBooking.rent_start_date);

        if (updateData.status === 'cancelled' && userRole === 'customer') {
          if (today >= startDate) {
            return {
              success: false,
              message: 'Cannot cancel booking after rent start date'
            };
          }
        }

        if (updateData.status === 'returned' && userRole !== 'admin') {
          return {
            success: false,
            message: 'Only admin can mark booking as returned'
          };
        }

        if (updateData.status === 'cancelled' || updateData.status === 'returned') {
          await VehicleModel.updateAvailability(existingBooking.vehicle_id, 'available');
        }
      }

      const updatedBooking = await BookingModel.update(id, updateData);

      if (!updatedBooking) {
        return {
          success: false,
          message: 'Failed to update booking'
        };
      }

      let vehicleDetails = null;
      if (updateData.status === 'returned') {
        vehicleDetails = await VehicleModel.findById(updatedBooking.vehicle_id);
      }

      return {
        success: true,
        message: updateData.status === 'cancelled'
          ? 'Booking cancelled successfully'
          : updateData.status === 'returned'
            ? 'Booking marked as returned. Vehicle is now available'
            : 'Booking updated successfully',
        data: {
          ...updatedBooking,
          ...(vehicleDetails && updateData.status === 'returned' ? {
            vehicle: {
              availability_status: vehicleDetails.availability_status
            }
          } : {})
        }
      };
    } catch (error) {
      Logger.error('Failed to update booking', error);
      return {
        success: false,
        message: 'Failed to update booking',
        errors: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async processOverdueBookings(): Promise<void> {
    try {
      await BookingModel.updateOverdueBookings();
      Logger.info('Overdue bookings processed successfully');
    } catch (error) {
      Logger.error('Failed to process overdue bookings', error);
    }
  }
}