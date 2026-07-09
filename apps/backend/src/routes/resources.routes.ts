import { Router } from 'express';
import { getBeds, updateBedStatus, getEquipment, updateEquipment, getStaff, updateStaffAvailability } from '../controllers/resources.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/beds', getBeds);
router.patch('/beds/:id/status', updateBedStatus);
router.get('/equipment', getEquipment);
router.patch('/equipment/:id', updateEquipment);
router.get('/staff', getStaff);
router.patch('/staff/:id/availability', updateStaffAvailability);

export default router;
