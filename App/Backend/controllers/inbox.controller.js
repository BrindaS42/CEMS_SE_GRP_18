// controllers/inbox.controller.js
const InboxMessage = require('../models/inbox.model.js');

// Get all messages for a recipient with filtering and pagination
const getMessages = async (req, res) => {
  try {
    const { recipient } = req.params;
    const {
      status,
      type,
      priority,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      status,
      type,
      priority,
      search,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const messages = await InboxMessage.findByRecipient(recipient, options);
    const total = await InboxMessage.countDocuments({ recipient });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Get a single message by ID
const getMessageById = async (req, res) => {
  try {
    const { id, recipient } = req.params;
    const message = await InboxMessage.findOne({ _id: id, recipient });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
};

// Create a new message
const createMessage = async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      recipient: req.params.recipient
    };

    const message = new InboxMessage(messageData);
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create message' });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { id, recipient } = req.params;
    const message = await InboxMessage.findOneAndUpdate(
      { _id: id, recipient },
      req.body,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id, recipient } = req.params;
    const message = await InboxMessage.findOneAndDelete({ _id: id, recipient });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id, recipient } = req.params;
    const message = await InboxMessage.findOne({ _id: id, recipient });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.markAsRead();
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Mark multiple messages as read
const markMultipleAsRead = async (req, res) => {
  try {
    const { recipient } = req.params;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    const result = await InboxMessage.markAsRead(messageIds, recipient);
    res.json({ 
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Archive a message
const archiveMessage = async (req, res) => {
  try {
    const { id, recipient } = req.params;
    const message = await InboxMessage.findOne({ _id: id, recipient });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.archive();
    res.json(message);
  } catch (error) {
    console.error('Error archiving message:', error);
    res.status(500).json({ error: 'Failed to archive message' });
  }
};

// Archive multiple messages
const archiveMultipleMessages = async (req, res) => {
  try {
    const { recipient } = req.params;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs array is required' });
    }

    const result = await InboxMessage.archiveMessages(messageIds, recipient);
    res.json({ 
      message: `${result.modifiedCount} messages archived`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error archiving messages:', error);
    res.status(500).json({ error: 'Failed to archive messages' });
  }
};

// Get unread count for a recipient
const getUnreadCount = async (req, res) => {
  try {
    const { recipient } = req.params;
    const count = await InboxMessage.getUnreadCount(recipient);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const { recipient } = req.params;
    
    const stats = await InboxMessage.aggregate([
      { $match: { recipient } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0, unread: 0, read: 0, archived: 0,
      urgent: 0, high: 0, medium: 0, low: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting message stats:', error);
    res.status(500).json({ error: 'Failed to get message statistics' });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { recipient } = req.params;
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const options = {
      search: q.trim(),
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const messages = await InboxMessage.findByRecipient(recipient, options);
    const total = await InboxMessage.countDocuments({
      recipient,
      $or: [
        { title: { $regex: q.trim(), $options: 'i' } },
        { content: { $regex: q.trim(), $options: 'i' } }
      ]
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      query: q.trim()
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
};

module.exports = {
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
};