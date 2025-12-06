import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const customerId = req.user.role === 'customer' ? req.user.userId : req.body.customer_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const bookingData = {
      ...req.body,
      customer_id: customerId
    };

    const result = await BookingService.createBooking(bookingData, req.user.userId, req.user.role);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await BookingService.getAllBookings(
      req.user.role,
      req.user.userId
    );

    return res.status(200).json(result);
  }

  static async updateBooking(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const id = parseInt(req.params.bookingId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const result = await BookingService.updateBooking(
      id,
      req.body,
      req.user.role,
      req.user.userId
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      const status = result.message.includes('not found') ? 404 :
        result.message.includes('cannot') || result.message.includes('Only admin') ? 403 : 400;
      return res.status(status).json(result);
    }
  }
}