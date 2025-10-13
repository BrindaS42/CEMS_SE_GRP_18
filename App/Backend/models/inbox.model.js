// models/inbox.model.js
const mongoose = require('mongoose');

const inboxMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  sender: {
    type: String,
    required: [true, 'Sender is required'],
    trim: true
  },
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['message', 'notification', 'alert', 'system'],
    default: 'message'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived', 'deleted'],
    default: 'unread'
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }],
  metadata: {
    source: String,
    externalId: String,
    reference: String
  },
  readAt: {
    type: Date,
    default: null
  },
  archivedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
inboxMessageSchema.index({ recipient: 1, status: 1 });
inboxMessageSchema.index({ recipient: 1, createdAt: -1 });
inboxMessageSchema.index({ type: 1, priority: 1 });
inboxMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for message age
inboxMessageSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for isExpired
inboxMessageSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware
inboxMessageSchema.pre('save', function(next) {
  if (this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  if (this.status === 'archived' && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  next();
});

// Static methods
inboxMessageSchema.statics.findByRecipient = function(recipient, options = {}) {
  const query = { recipient };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { content: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

inboxMessageSchema.statics.getUnreadCount = function(recipient) {
  return this.countDocuments({ recipient, status: 'unread' });
};

inboxMessageSchema.statics.markAsRead = function(messageIds, recipient) {
  return this.updateMany(
    { _id: { $in: messageIds }, recipient },
    { status: 'read', readAt: new Date() }
  );
};

inboxMessageSchema.statics.archiveMessages = function(messageIds, recipient) {
  return this.updateMany(
    { _id: { $in: messageIds }, recipient },
    { status: 'archived', archivedAt: new Date() }
  );
};

// Instance methods
inboxMessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

inboxMessageSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

const InboxMessage = mongoose.model('InboxMessage', inboxMessageSchema);

module.exports = InboxMessage;