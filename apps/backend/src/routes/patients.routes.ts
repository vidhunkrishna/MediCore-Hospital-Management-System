import { Router } from 'express';
import { getPatients, getPatient, createPatient, updatePatient, admitPatient, dischargePatient } from '../controllers/patients.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.post('/:id/admit', admitPatient);
router.post('/:id/discharge', dischargePatient);

export default router;
