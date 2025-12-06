import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validateBooking } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, validateBooking, BookingController.createBooking);
router.get('/', authenticate, BookingController.getAllBookings);
router.put('/:bookingId', authenticate, BookingController.updateBooking);

export default router;