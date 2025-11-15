import { Router } from 'express'
import { fetchAllMessages, postMessage } from '../controllers/chatroom.controller.js';
import auth from '../../middleware/auth.middleware.js'
const { authentication, authorizeRoles } = auth

const router = Router()

router.use(authentication, authorizeRoles('organizer', 'student'))


router.get('/:eventId/messages', fetchAllMessages);
router.post('/:eventId/message', postMessage);

