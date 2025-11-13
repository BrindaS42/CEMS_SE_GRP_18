import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/profile.controller.js';

const { authentication, authorizeRoles } = auth;
const router = Router();

router.use(authentication, authorizeRoles('organizer', 'admin', 'student', 'sponsor'));
router.get('/', getUserProfile);
router.put('/', updateUserProfile);

export default router;


