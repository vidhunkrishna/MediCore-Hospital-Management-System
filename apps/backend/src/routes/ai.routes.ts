import { Router } from 'express';
import { getHealthScore, getInsights, getForecast, getRecommendations, handleChat } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/health-score', getHealthScore);
router.get('/insights', getInsights);
router.get('/forecast', getForecast);
router.get('/recommendations', getRecommendations);
router.post('/chat', handleChat);

export default router;
