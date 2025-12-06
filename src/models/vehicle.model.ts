import { query } from '../config/database';
import { Vehicle } from '../types';

export class VehicleModel {
  static async create(vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    const result = await query(
      `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        vehicleData.vehicle_name,
        vehicleData.type,
        vehicleData.registration_number,
        vehicleData.daily_rent_price,
        vehicleData.availability_status || 'available'
      ]
    );

    return result.rows[0];
  }

  static async findAll(): Promise<Vehicle[]> {
    const result = await query(
      'SELECT * FROM vehicles ORDER BY created_at DESC'
    );

    return result.rows;
  }

  static async findById(id: number): Promise<Vehicle | null> {
    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByRegistration(registrationNumber: string): Promise<Vehicle | null> {
    const result = await query(
      'SELECT * FROM vehicles WHERE registration_number = $1',
      [registrationNumber]
    );

    return result.rows[0] || null;
  }

  static async update(id: number, updateData: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>): Promise<Vehicle | null> {
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
      `UPDATE vehicles SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  static async hasActiveBookings(vehicleId: number): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) FROM bookings WHERE vehicle_id = $1 AND status = $2',
      [vehicleId, 'active']
    );

    return parseInt(result.rows[0].count) > 0;
  }

  static async updateAvailability(vehicleId: number, status: 'available' | 'booked'): Promise<Vehicle | null> {
    const result = await query(
      'UPDATE vehicles SET availability_status = $1 WHERE id = $2 RETURNING *',
      [status, vehicleId]
    );

    return result.rows[0] || null;
  }

  static async findAvailable(): Promise<Vehicle[]> {
    const result = await query(
      'SELECT * FROM vehicles WHERE availability_status = $1 ORDER BY created_at DESC',
      ['available']
    );

    return result.rows;
  }
}