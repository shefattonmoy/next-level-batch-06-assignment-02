import { query } from '../config/database';
import { Booking } from '../types';
import { Validation } from '../utils/validation';

export class BookingModel {
  static async create(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    const result = await query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        bookingData.customer_id,
        bookingData.vehicle_id,
        bookingData.rent_start_date,
        bookingData.rent_end_date,
        bookingData.total_price,
        bookingData.status || 'active'
      ]
    );

    return result.rows[0];
  }

  static async findById(id: number): Promise<Booking | null> {
    const result = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByCustomer(customerId: number): Promise<Booking[]> {
    const result = await query(
      `SELECT b.*, 
              v.vehicle_name, v.registration_number, v.type,
              u.name as customer_name, u.email as customer_email
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.customer_id = u.id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC`,
      [customerId]
    );

    return result.rows;
  }

  static async findAll(): Promise<Booking[]> {
    const result = await query(
      `SELECT b.*, 
              v.vehicle_name, v.registration_number, v.type,
              u.name as customer_name, u.email as customer_email
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.customer_id = u.id
       ORDER BY b.created_at DESC`
    );

    return result.rows;
  }

  static async update(id: number, updateData: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>): Promise<Booking | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE bookings SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  static async checkVehicleAvailability(vehicleId: number, startDate: Date, endDate: Date): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) FROM bookings 
       WHERE vehicle_id = $1 
       AND status = 'active'
       AND (
         (rent_start_date BETWEEN $2 AND $3) OR
         (rent_end_date BETWEEN $2 AND $3) OR
         ($2 BETWEEN rent_start_date AND rent_end_date)
       )`,
      [vehicleId, startDate, endDate]
    );

    return parseInt(result.rows[0].count) === 0;
  }

  static async calculatePrice(vehicleId: number, startDate: string, endDate: string): Promise<number> {
    const vehicleResult = await query(
      'SELECT daily_rent_price FROM vehicles WHERE id = $1',
      [vehicleId]
    );

    if (vehicleResult.rows.length === 0) {
      throw new Error('Vehicle not found');
    }

    const dailyPrice = parseFloat(vehicleResult.rows[0].daily_rent_price);
    const days = Validation.calculateDaysBetween(startDate, endDate);

    return dailyPrice * days;
  }

  static async updateOverdueBookings(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await query(
      `UPDATE bookings 
       SET status = 'returned', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'active' 
       AND rent_end_date < $1`,
      [today]
    );

    await query(
      `UPDATE vehicles v
       SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP
       FROM bookings b
       WHERE v.id = b.vehicle_id
       AND b.status = 'returned'
       AND b.rent_end_date < $1`,
      [today]
    );
  }
}