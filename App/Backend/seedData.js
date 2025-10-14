// seedData.js - Script to create sample data for testing
const mongoose = require('mongoose');
const InboxMessage = require('./models/inbox.model.js');
require('dotenv').config();

const sampleMessages = [
  {
    title: 'Welcome to the Event Management System',
    content: 'Welcome to our event management platform! This is your first message in the inbox. You can create, manage, and track all your events from here.',
    sender: 'system@events.com',
    recipient: 'user@example.com',
    type: 'system',
    priority: 'medium',
    status: 'unread',
    category: 'welcome'
  },
  {
    title: 'Event Registration Reminder',
    content: 'Don\'t forget to register for the upcoming React Workshop scheduled for next Friday. Limited seats available!',
    sender: 'organizer@events.com',
    recipient: 'user@example.com',
    type: 'notification',
    priority: 'high',
    status: 'unread',
    category: 'reminder'
  },
  {
    title: 'Your Event Draft Needs Review',
    content: 'Your event draft "Advanced JavaScript Workshop" is ready for review. Please check the details and submit for approval.',
    sender: 'admin@events.com',
    recipient: 'user@example.com',
    type: 'alert',
    priority: 'medium',
    status: 'read',
    category: 'review'
  },
  {
    title: 'Event Approved: Machine Learning Bootcamp',
    content: 'Great news! Your event "Machine Learning Bootcamp" has been approved and is now live on the platform.',
    sender: 'admin@events.com',
    recipient: 'user@example.com',
    type: 'notification',
    priority: 'high',
    status: 'read',
    category: 'approval'
  },
  {
    title: 'Weekly Event Summary',
    content: 'Here\'s your weekly summary: 3 new events created, 2 events approved, 15 new registrations received.',
    sender: 'system@events.com',
    recipient: 'user@example.com',
    type: 'message',
    priority: 'low',
    status: 'unread',
    category: 'summary'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inbox-app';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing messages
    await InboxMessage.deleteMany({});
    console.log('Cleared existing messages');

    // Insert sample messages
    await InboxMessage.insertMany(sampleMessages);
    console.log(`Inserted ${sampleMessages.length} sample messages`);

    // Get stats
    const stats = await InboxMessage.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } }
        }
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Stats:', stats[0] || { total: 0, unread: 0, read: 0 });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
