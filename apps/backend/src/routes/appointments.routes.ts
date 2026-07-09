import { Router } from 'express';
import { getAppointments, getAppointment, createAppointment, updateAppointment, updateAppointmentStatus } from '../controllers/appointments.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
