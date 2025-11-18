import Event from '../models/event.model.js';
import User from '../models/user.model.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex

    // Using Promise.all to search in parallel
    const [events, users] = await Promise.all([
      // Search Events
      Event.find({
        $or: [
          { title: regex },
          { description: regex },
          { categoryTags: regex }
        ],
        status: 'published' // Only search published events
      }).select('title description posterUrl categoryTags timeline venue config').limit(10).lean(),

      // Search Users (students, organizers, sponsors)
      User.find({
        $or: [
          { 'profile.name': regex },
          { email: regex },
          { 'sponsorDetails.firmDescription': regex }
        ]
      }).select('profile role email sponsorDetails').limit(20).lean()
    ]);

    // Separate users into different categories
    const sponsors = users.filter(u => u.role === 'sponsor');
    const organizers = users.filter(u => u.role === 'organizer');
    const students = users.filter(u => u.role === 'student');

    res.status(200).json({
      events,
      sponsors,
      organizers,
      users: students, // Renaming for clarity on the frontend
    });

  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      message: "Server error during search.",
      error: error.message,
    });
  }
};