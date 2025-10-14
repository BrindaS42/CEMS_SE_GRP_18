// routes/inbox.route.js
const express = require('express');
const {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  markMultipleAsRead,
  archiveMessage,
  archiveMultipleMessages,
  getUnreadCount,
  getMessageStats,
  searchMessages
} = require('../controllers/inbox.controller.js');
const auth = require('../middleware/auth.middleware.js');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth(['user', 'admin', 'organizer']));

// Message CRUD operations
router.get('/recipient/:recipient', getMessages);
router.get('/recipient/:recipient/search', searchMessages);
router.get('/recipient/:recipient/stats', getMessageStats);
router.get('/recipient/:recipient/unread-count', getUnreadCount);
router.get('/recipient/:recipient/message/:id', getMessageById);
router.post('/recipient/:recipient', createMessage);
router.put('/recipient/:recipient/message/:id', updateMessage);
router.delete('/recipient/:recipient/message/:id', deleteMessage);

// Bulk operations
router.patch('/recipient/:recipient/mark-read', markMultipleAsRead);
router.patch('/recipient/:recipient/archive', archiveMultipleMessages);

// Single message operations
router.patch('/recipient/:recipient/message/:id/read', markAsRead);
router.patch('/recipient/:recipient/message/:id/archive', archiveMessage);

module.exports = router;