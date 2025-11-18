import { Router } from 'express'
import { fetchAllMessages, postMessage } from '../../controllers/event_controllers/chatroom.controller.js';
import auth from '../../middleware/auth.middleware.js'
const { authentication, authorizeRoles, checkSuspension } = auth

const router = Router()

router.use(authentication, authorizeRoles('organizer', 'student'))


router.get('/:eventId/messages', fetchAllMessages);
router.post('/:eventId/message', checkSuspension,postMessage);

export default router;