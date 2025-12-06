import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  static async createVehicle(req: Request, res: Response) {
    const result = await VehicleService.createVehicle(req.body);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  }

  static async getAllVehicles(req: Request, res: Response) {
    const result = await VehicleService.getAllVehicles();
    return res.status(200).json(result);
  }

  static async getVehicleById(req: Request, res: Response) {
    const id = parseInt(req.params.vehicleId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    const result = await VehicleService.getVehicleById(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    const id = parseInt(req.params.vehicleId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    const result = await VehicleService.updateVehicle(id, req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      const status = result.message.includes('not found') ? 404 : 400;
      return res.status(status).json(result);
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    const id = parseInt(req.params.vehicleId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    const result = await VehicleService.deleteVehicle(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      const status = result.message.includes('not found') ? 404 : 400;
      return res.status(status).json(result);
    }
  }

  static async getAvailableVehicles(req: Request, res: Response) {
    const result = await VehicleService.getAvailableVehicles();
    return res.status(200).json(result);
  }
}