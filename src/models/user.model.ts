import { query } from '../config/database';
import { User } from '../types';
import bcrypt from 'bcrypt';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [userData.name, userData.email.toLowerCase(), hashedPassword, userData.phone, userData.role || 'customer']
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findAll(): Promise<User[]> {
    const result = await query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
  }

  static async update(id: number, updateData: Partial<Omit<User, 'id' | 'password' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'email' && value) {
        fields.push(`${key} = $${paramIndex}`);
        values.push((value as string).toLowerCase());
        paramIndex++;
      } else if (value !== undefined) {
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
      `UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  static async hasActiveBookings(userId: number): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) FROM bookings WHERE customer_id = $1 AND status = $2',
      [userId, 'active']
    );

    return parseInt(result.rows[0].count) > 0;
  }

  static async comparePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  }
}