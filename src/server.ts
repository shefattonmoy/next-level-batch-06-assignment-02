import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import userRoutes from './routes/user.routes';
import bookingRoutes from './routes/booking.routes';
import { BookingService } from './services/booking.service';
import { Logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.url}`);
  next();
});


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Logger.error('Unhandled error', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


setInterval(async () => {
  await BookingService.processOverdueBookings();
}, 60 * 60 * 1000);


app.listen(PORT, () => {
  Logger.info(`Server is running on port ${PORT}`);
  
  BookingService.processOverdueBookings().then(() => {
    Logger.info('Initial overdue booking processing completed');
  }).catch(error => {
    Logger.error('Failed to process overdue bookings', error);
  });
});


export default app;