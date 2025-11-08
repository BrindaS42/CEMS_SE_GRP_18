import Event from "../../models/event.model.js";
import Team from "../../models/team.model.js";
import Registration from "../../models/registration.model.js";
// Helper: get team ids for a user (leader or member)
async function getUserTeamIds(userId) {
  const teams = await Team.find({
    $or: [{ leader: userId }, { "members.user": userId }],
  })
    .select("_id")
    .lean();
  return teams.map((t) => t._id);
}

export async function getEventsForUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });
    const teamIds = await getUserTeamIds(userId);
    const events = await Event.find({ createdBy: { $in: teamIds } }).lean();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getPublishedEvents(req, res) {
  try {
    const userId = req.user?.id;
    const teamIds = await getUserTeamIds(userId);
    const events = await Event.find({
      createdBy: { $in: teamIds },
      status: "published",
    }).lean();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getDraftEvents(req, res) {
  try {
    const userId = req.user?.id;
    const teamIds = await getUserTeamIds(userId);
    const events = await Event.find({
      createdBy: { $in: teamIds },
      status: "draft",
    }).lean();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Stubs for registration logs and check-ins (replace with your collections)
export async function getRegistrationLogs(req, res) {
  try {
    const { eventId } = req.params;
    // TODO: Join with real Registration model when available
    res.json([]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getCheckIns(req, res) {
  try {
    const { eventId } = req.params;
    // TODO: Join with real CheckIn model when available
    res.json([]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export const fetchCompletedEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    console.log("callling..", organizerId);

    const team = await Team.findOne({ leader: organizerId });

    if (!team) {
      return res.status(404).json({ message: "Organizer team not found." });
    }

    const completedEvents = await Event.find({
      createdBy: team._id,
      status: "completed",
    })
      .select("title description startDate endDate registrationCount")
      .sort({ endDate: -1 });

    return res.status(200).json(completedEvents);
  } catch (error) {
    console.error("Error fetching completed events:", error);
    res
      .status(500)
      .json({
        message: "Server error while fetching completed events.",
        error: error.message,
      });
  }
};

export const getRegisteredStudentsByEID = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({
      eventId: eventId,
    })
      .populate({
        path: "studentId",
        select: "profile.name profile.contactNo email",
      })
      .populate({
        path: "studentTeamId",
        select: "name leader",
      })
      .select("-checkInCode")
      .lean();

    if (!registrations || registrations.length === 0) {
      return res
        .status(200)
        .json({
          message: "No registrations found for this event.",
          registrations: [],
        });
    }

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registered students:", error);
    res.status(500).json({
      message: "Server error while fetching registered students.",
      error: error.message,
    });
  }
};

export const getAttendeesByEID = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await Registration.find({
      eventId: eventId,

      checkIns: {
        $elemMatch: {
          status: "present",
        },
      },
    })
      .populate("studentId", "name email contactNo profilePic")
      .select("studentId registrationType checkIns")
      .lean();

    if (!attendees || attendees.length === 0) {
      return res
        .status(200)
        .json({ message: "No attendees recorded yet.", attendees: [] });
    }

    res.status(200).json(attendees);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({
      message: "Server error while fetching attendees.",
      error: error.message,
    });
  }
};

export const getReviewRatingsByEID = async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventData = await Event.findById(eventId)
      .select("ratings")
      .populate({
        path: "ratings",
        populate: {
          path: "by",
          select: "profile.name profile.profilePic",
        },
      })
      .lean();

    if (!eventData) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json(eventData.ratings || []);
  } catch (error) {
    console.error("Error fetching ratings and reviews:", error);
    res.status(500).json({
      message: "Server error while fetching ratings and reviews.",
      error: error.message,
    });
  }
};

export const getOrganizerTeams = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const teams = await Team.find({
      $or: [{ leader: organizerId }, { "members.user": organizerId }],
    })
      .select("name leader members")
      .populate("leader", "profile.name")
      .populate("members.user", "profile.name")
      .lean();

    if (!teams || teams.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching organizer teams:", error);
    res.status(500).json({
      message: "Server error while fetching organizer teams.",
      error: error.message,
    });
  }
};

export const addAnnouncement = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { message, title, date, time } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ message: "Announcement message is required." });
    }

    const newAnnouncement = {
      title: title || "Update",
      message: message,
      date: date || new Date(),
      time: time,
      author: req.user._id,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $push: { announcements: newAnnouncement } },
      { new: true, runValidators: true }
    )
      .select("announcements")
      .populate("announcements.author", "profile.name");

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    const latestAnnouncement = updatedEvent.announcements.slice(-1)[0];
    res.status(201).json({
      message: "Announcement added successfully.",
      announcement: latestAnnouncement,
    });
  } catch (error) {
    console.error("Error adding announcement:", error);
    console.error("Mongoose Error Name:", error.name);
    console.error("Mongoose Error Message:", error.message);
    console.error("Mongoose Error Details (if validation):", error.errors);
    res
      .status(500)
      .json({
        message: "Server error while adding announcement.",
        error: error.message,
      });
  }
};

export const editAnnouncement = async (req, res) => {
  try {
    const { eventId, announcementId } = req.params;
    const { message, title, date, time } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ message: "Announcement message is required." });
    }

    const updatePath = `announcements.$[elem]`;

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          [updatePath]: {
            title: title,
            message: message,
            date: date,
            time: time,
            author: req.user._id,
          },
        },
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ "elem._id": announcementId }],
      }
    ).select("announcements");

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ message: "Event or Announcement not found." });
    }

    const editedAnnouncement = updatedEvent.announcements.find(
      (ann) => ann._id.toString() === announcementId
    );

    res.status(200).json({
      message: "Announcement updated successfully.",
      announcement: editedAnnouncement,
    });
  } catch (error) {
    console.error("Error editing announcement:", error);
    res
      .status(500)
      .json({
        message: "Server error while editing announcement.",
        error: error.message,
      });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { eventId, announcementId } = req.params;

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $pull: {
          announcements: { _id: announcementId },
        },
      },
      { new: true }
    ).select("announcements");

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({
      message: "Announcement deleted successfully.",
      announcements: updatedEvent.announcements,
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res
      .status(500)
      .json({
        message: "Server error while deleting announcement.",
        error: error.message,
      });
  }
};
