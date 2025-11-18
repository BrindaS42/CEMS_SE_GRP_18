import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'; 
import { 
    handleCollegeRegistration,
    suspendCollegeAndEntities,
    unsuspendCollegeAndEntities,
    toggleSuspension,
    createReport,
    getAllEventsForAdmin,
    getAllUsersForAdmin,
    getAllAdsForAdmin
 } from '../controllers/admin.controller.js';
import { getAllCollegesForAdmin } from '../controllers/college.controller.js';

const { authentication, authorizeRoles } = authMiddleware;
const router = express.Router();

router.post('/report/:modelType/:id', authentication, createReport);

router.use(authentication, authorizeRoles('admin'));

router.patch('/colleges/:collegeId/handle', handleCollegeRegistration);

router.patch('/colleges/:collegeId/suspend', suspendCollegeAndEntities);

router.patch('/colleges/:collegeId/unsuspend', unsuspendCollegeAndEntities);

router.get('/colleges', getAllCollegesForAdmin);

router.get('/events', getAllEventsForAdmin);
router.get('/users', getAllUsersForAdmin);
router.get('/ads', getAllAdsForAdmin);

router.patch('/suspend/:modelType/:id', toggleSuspension);

export default router;