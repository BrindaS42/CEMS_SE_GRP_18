import Event from "../../models/event.model.js";
import Registration from "../../models/registration.model.js";


export const getListOfAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, categoryTags } = req.query;

    const query = { status: "published" };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (categoryTags) {
      const tags = Array.isArray(categoryTags) ? categoryTags : categoryTags.split(',');
      if (tags.length > 0) {
        query.categoryTags = { $in: tags };
      }
    }

    const events = await Event.aggregate([
      { $match: query },
      {
        $addFields: {
          registrationCount: { $size: "$registrations" }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      { $project: { title: 1, description: 1, categoryTags: 1, venue: 1, timeline: 1, gallery: 1, registrationCount: 1, createdAt: 1 } }
    ]);

    const totalEvents = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(totalEvents / parseInt(limit)),
        total: totalEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch events", error: error.message });
  }
};


export const getEventDetailsByID = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event details", error: error.message });
  }
};


export const addCheckInByTimeline = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantId, timelineTitle, status } = req.body;

    const registration = await Registration.findOne({ eventId, userId: participantId });
    if (!registration) return res.status(404).json({ success: false, message: "Participant not registered" });

    const checkIn = registration.checkIns.find(c => c.timelineTitle === timelineTitle);
    if (checkIn) {
      checkIn.status = status;
      checkIn.checkedInAt = new Date();
    } else {
      registration.checkIns.push({ timelineTitle, status, checkedInAt: new Date() });
    }

    await registration.save();
    res.status(200).json({ success: true, message: `Check-in ${status} for ${timelineTitle}`, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update check-in", error: error.message });
  }
};


export const getAnnouncementsByEID = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("announcements");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({ success: true, announcements: event.announcements || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch announcements", error: error.message });
  }
};

// ✅ Get sponsors
export const getListOfEventSponsorsWithListOf = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("sponsors");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({ success: true, sponsors: event.sponsors || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch sponsors", error: error.message });
  }
};


export const addRatingReviewByEID = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const alreadyRated = event.ratings.some(r => r.by.toString() === req.user.id);
    if (alreadyRated)
      return res.status(400).json({ success: false, message: "You already submitted a review" });

    event.ratings.push({
      by: req.user.id,
      rating,
      review,
      createdAt: new Date(),
    });

    await event.save();

    res.status(201).json({ success: true, message: "Review added successfully", ratings: event.ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add review", error: error.message });
  }
};


export const getListOfRatingReviewByEID = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate("ratings.by", "name");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({ success: true, reviews: event.ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};