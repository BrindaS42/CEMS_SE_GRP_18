import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile, getAllStudents, getAllOrganizers, getAllSponsors, getAllAdmins } from '../controllers/profile.controller.js';

const { authentication, authorizeRoles } = auth;
const router = Router();

router.use(authentication, authorizeRoles('organizer', 'admin', 'student', 'sponsor'));
router.get('/', getUserProfile);
router.put('/', updateUserProfile);
router.get('/students', getAllStudents);
router.get('/organizers', getAllOrganizers);
router.get('/sponsors', getAllSponsors);
router.get('/admins', getAllAdmins);

export default router;


