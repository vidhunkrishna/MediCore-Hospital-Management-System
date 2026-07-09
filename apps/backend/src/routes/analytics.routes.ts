import { Router } from 'express';
import { getOverview, getOccupancyTrend, getAppointmentVolume, getDepartmentLoad, getAlerts, resolveAlert } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/overview', getOverview);
router.get('/occupancy', getOccupancyTrend);
router.get('/appointments', getAppointmentVolume);
router.get('/departments', getDepartmentLoad);
router.get('/alerts', getAlerts);
router.patch('/alerts/:id/resolve', resolveAlert);

export default router;
