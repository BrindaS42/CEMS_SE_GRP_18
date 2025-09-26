import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import { getOrganizerProfile, updateOrganizerProfile } from '../controllers/profile.controller.js';

const { authentication, authorizeRoles } = auth;
const router = Router();

// Organizer profile routes
router.use(authentication, authorizeRoles('organizer', 'admin', 'student'));
router.get('/', getOrganizerProfile);
router.put('/', updateOrganizerProfile);

export default router;


