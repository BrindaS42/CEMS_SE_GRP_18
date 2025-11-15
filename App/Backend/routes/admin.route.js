

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'; 
import { handleCollegeRegistration,
         suspendCollegeAndEntities,
        toggleSuspension,
        createReport
 } from '../controllers/admin.controller.js';

const { authentication, authorizeRoles } = authMiddleware;
const router = express.Router();

router.use(authentication, authorizeRoles('admin')); 

router.route('/colleges/:collegeId/status')
    .put(handleCollegeRegistration);
router.route('/colleges/:collegeId/suspend-entities')
    .put(suspendCollegeAndEntities);
router.route('/suspend/:modelType/:id')
    .put(toggleSuspension);
router.route('/report/:modelType/:id')
    .post(createReport);
export default router;