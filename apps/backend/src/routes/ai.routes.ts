import { Router } from 'express';
import { getHealthScore, getInsights, getForecast, getRecommendations } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/health-score', getHealthScore);
router.get('/insights', getInsights);
router.get('/forecast', getForecast);
router.get('/recommendations', getRecommendations);

export default router;
