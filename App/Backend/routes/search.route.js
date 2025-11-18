import express from 'express';
import { globalSearch } from '../controllers/search.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware.authentication, globalSearch);

export default router;