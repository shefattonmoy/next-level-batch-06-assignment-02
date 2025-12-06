import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateVehicle } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', VehicleController.getAllVehicles);
router.get('/available', VehicleController.getAvailableVehicles);
router.get('/:vehicleId', VehicleController.getVehicleById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), validateVehicle, VehicleController.createVehicle);
router.put('/:vehicleId', authenticate, authorize('admin'), validateVehicle, VehicleController.updateVehicle);
router.delete('/:vehicleId', authenticate, authorize('admin'), VehicleController.deleteVehicle);

export default router;