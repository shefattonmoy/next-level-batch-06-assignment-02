import { Request, Response, NextFunction } from 'express';
import { Validation } from '../utils/validation';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, role } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !Validation.isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!Validation.isValidPhone(phone)) {
    errors.push('Valid phone number is required (10-15 digits, can start with +)');
  }

  if (role && !['admin', 'customer'].includes(role)) {
    errors.push('Role must be either admin or customer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    phone: phone.trim(),
    role: role || 'customer'
  };

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || !Validation.isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

export const validateVehicle = (req: Request, res: Response, next: NextFunction) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
  const errors: string[] = [];

  if (!vehicle_name || vehicle_name.trim().length < 2) {
    errors.push('Vehicle name must be at least 2 characters long');
  }

  if (!type || !['car', 'bike', 'van', 'SUV'].includes(type)) {
    errors.push('Type must be one of: car, bike, van, SUV');
  }

  if (!registration_number || registration_number.trim().length < 3) {
    errors.push('Valid registration number is required');
  }

  if (!daily_rent_price || isNaN(daily_rent_price) || daily_rent_price <= 0) {
    errors.push('Daily rent price must be a positive number');
  }

  if (availability_status && !['available', 'booked'].includes(availability_status)) {
    errors.push('Availability status must be either available or booked');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const { vehicle_id, rent_start_date, rent_end_date } = req.body;
  const errors: string[] = [];

  if (!vehicle_id || isNaN(vehicle_id)) {
    errors.push('Valid vehicle ID is required');
  }

  if (!rent_start_date || !Validation.isValidDate(rent_start_date)) {
    errors.push('Valid rent start date is required');
  }

  if (!rent_end_date || !Validation.isValidDate(rent_end_date)) {
    errors.push('Valid rent end date is required');
  }

  if (rent_start_date && rent_end_date) {
    if (!Validation.isFutureDate(rent_start_date)) {
      errors.push('Rent start date must be in the future');
    }

    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    if (end <= start) {
      errors.push('Rent end date must be after rent start date');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};