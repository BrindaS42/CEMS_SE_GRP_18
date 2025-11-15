import express from "express";
import authMiddleware from '../../middleware/auth.middleware.js';
import {
    getDashboardStats,
    getEventWiseRatings,
    getAttendanceRatio,
    getEventPerformance
} from "../../controllers/organizer_controllers/analytics.controller.js";

const { authentication, authorizeRoles } = authMiddleware;
const router = express.Router();

router.use(authentication, authorizeRoles('organizer'));

router.get('/stats', getDashboardStats);
router.get('/event-ratings', getEventWiseRatings);
router.get('/attendance-ratio', getAttendanceRatio);
router.get('/performance-overview', getEventPerformance);

export default router;