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

// All routes in this file are protected and for admins only
router.use(authentication, authorizeRoles('admin')); 

router.patch('/colleges/:collegeId/handle', handleCollegeRegistration);

// Matches `suspendCollege` thunk in admin.slice.js
router.patch('/colleges/:collegeId/suspend', suspendCollegeAndEntities);

// Matches `unsuspendCollege` thunk in admin.slice.js
router.patch('/colleges/:collegeId/unsuspend', unsuspendCollegeAndEntities);

// Matches `fetchAllCollegesForAdmin` thunk in admin.slice.js
router.get('/colleges', getAllCollegesForAdmin);

// Routes for other data types
router.get('/events', getAllEventsForAdmin);
router.get('/users', getAllUsersForAdmin);
router.get('/ads', getAllAdsForAdmin);

// Generic routes for other management tasks
router.patch('/suspend/:modelType/:id', toggleSuspension);
router.post('/report/:modelType/:id', createReport);

export default router;