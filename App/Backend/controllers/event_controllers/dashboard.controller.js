import Event from '../../models/event.model.js'
import Team from '../../models/team.model.js'
import Registration from '../../models/registration.model.js';
// Helper: get team ids for a user (leader or member)
async function getUserTeamIds(userId) {
  const teams = await Team.find({
    $or: [
      { leader: userId },
      { 'members.user': userId },
    ],
  }).select('_id').lean()
  return teams.map((t) => t._id)
}

export async function getEventsForUser(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' })
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds } }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getPublishedEvents(req, res) {
  try {
    const userId = req.user?.id
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds }, status: 'published' }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getDraftEvents(req, res) {
  try {
    const userId = req.user?.id
    const teamIds = await getUserTeamIds(userId)
    const events = await Event.find({ createdBy: { $in: teamIds }, status: 'draft' }).lean()
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// Stubs for registration logs and check-ins (replace with your collections)
export async function getRegistrationLogs(req, res) {
  try {
    const { eventId } = req.params
    // TODO: Join with real Registration model when available
    res.json([])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getCheckIns(req, res) {
  try {
    const { eventId } = req.params
    // TODO: Join with real CheckIn model when available
    res.json([])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}


export const fetchCompletedEvents = async (req, res) => {
    try {
        // 1. Get the current user's ID (assumed to be attached by auth middleware)
        const organizerId = req.user._id; 

        // 2. Find the team(s) where the user is the leader or a member
        // For simplicity, we assume the user is the leader of one team for now
        const team = await Team.findOne({ leader: organizerId }); 

        if (!team) {
            return res.status(404).json({ message: "Organizer team not found." });
        }

        // 3. Find events created by this team with status 'completed'
        const completedEvents = await Event.find({
            createdBy: team._id, // Filter by the organizer's team
            status: 'completed'  // Filter by the desired status
        })
        .select('title description startDate endDate registrationCount') // Select necessary fields for the dashboard list
        .sort({ endDate: -1 }); // Show most recently completed events first

        res.status(200).json(completedEvents);

    } catch (error) {
        console.error("Error fetching completed events:", error);
        res.status(500).json({ message: 'Server error while fetching completed events.', error: error.message });
    }
};

export const getRegisteredStudentsByEID = async (req, res) => {
  try {
      const { eventId } = req.params;

      // 1. Fetch all registrations for the given event ID.
      // 2. Populate the studentId to get student profile details.
      // 3. Populate the studentTeamId if it's a team registration.
      const registrations = await Registration.find({
          eventId: eventId
      })
      .populate({
          path: 'studentId', 
          select: 'profile.name profile.contactNo email' // Select specific fields from the User model's profile
      })
      .populate({
          path: 'studentTeamId', 
          select: 'name leader' // Select name and leader from the Team model
      }) 
      .select('-checkInCode') // Exclude the checkInCode for security/privacy
      .lean(); 

      if (!registrations || registrations.length === 0) {
          return res.status(200).json({ message: "No registrations found for this event.", registrations: [] });
      }

      res.status(200).json(registrations);

  } catch (error) {
      console.error("Error fetching registered students:", error);
      res.status(500).json({ 
          message: 'Server error while fetching registered students.', 
          error: error.message 
      });
  }
};

export const getAttendeesByEID = async (req, res) => {
  try {
      const { eventId } = req.params;

      // Note: Logic for "present" status is critical here. 
      [cite_start]// We find registrations where at least one checkIn status is 'present' [cite: 749-753].
      const attendees = await Registration.find({
          eventId: eventId,
          // $elemMatch finds documents where the 'checkIns' array contains at least one element 
          // that matches the specified criteria.
          checkIns: {
              $elemMatch: {
                  status: 'present' 
                  // You might also want to filter by a specific timelineId if check-ins are timeline-specific
              }
          }
      })
      .populate('studentId', 'name email contactNo profilePic') 
      .select('studentId registrationType checkIns')
      .lean(); 

      if (!attendees || attendees.length === 0) {
          return res.status(200).json({ message: "No attendees recorded yet.", attendees: [] });
      }

      res.status(200).json(attendees);

  } catch (error) {
      console.error("Error fetching attendees:", error);
      res.status(500).json({ 
          message: 'Server error while fetching attendees.', 
          error: error.message 
      });
  }
};

export const getReviewRatingsByEID = async (req, res) => {
  try {
      const { eventId } = req.params;

      // 1. Find the event and project only the 'ratings' array
      const eventData = await Event.findById(eventId)
          .select('ratings')
          .populate({
              path: 'ratings.by', // The 'by' field in the ratings array refers to the User model
              select: 'profile.name profile.profilePic' // Select the user's name and picture
          })
          .lean(); 

      if (!eventData) {
          return res.status(404).json({ message: "Event not found." });
      }

      // The result is just the populated array of ratings
      res.status(200).json(eventData.ratings || []); 

  } catch (error) {
      console.error("Error fetching ratings and reviews:", error);
      res.status(500).json({ 
          message: 'Server error while fetching ratings and reviews.', 
          error: error.message 
      });
  }
};

export const getOrganizerTeams = async (req, res) => {
  try {
      const organizerId = req.user._id; 

      // 1. Query the Team model using the $or operator.
      // The user is considered part of the team if:
      // a) They are the 'leader' OR
      // b) Their ID appears in the 'members' array.
      const teams = await Team.find({
          $or: [
              { leader: organizerId }, // The user is the leader of the team
              { 'members.user': organizerId } // The user is listed in the members array
          ]
      })
      .select('name leader members') // Select key fields for the dashboard list
      .populate('leader', 'profile.name') // Optionally populate the leader's name
      .populate('members.user', 'profile.name') // Optionally populate members' names
      .lean(); 

      if (!teams || teams.length === 0) {
          // Return an empty array if no teams are found, which is a success case for the frontend.
          return res.status(200).json([]);
      }

      res.status(200).json(teams);

  } catch (error) {
      console.error("Error fetching organizer teams:", error);
      res.status(500).json({ 
          message: 'Server error while fetching organizer teams.', 
          error: error.message 
      });
  }
};

export const addAnnouncement = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { message, title, date, time } = req.body; 

        if (!message) {
            return res.status(400).json({ message: "Announcement message is required." });
        }
        
        // Ensure the organizer has rights to this event (e.g., they belong to createdBy team) - 
        // We'll rely on a future middleware check for this, but for now, we trust the authentication.

        const newAnnouncement = {
            title: title || 'Update',
            message: message,
            date: date || new Date(),
            time: time,
            author: req.user._id, // Set the logged-in user as the author
        };

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $push: { announcements: newAnnouncement } }, 
            { new: true, runValidators: true }
        )
        .select('announcements') // Only return the announcements array
        .populate('announcements.author', 'profile.name'); 

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }
        
        const latestAnnouncement = updatedEvent.announcements.slice(-1)[0]; 
        res.status(201).json({ 
            message: "Announcement added successfully.",
            announcement: latestAnnouncement 
        });

    } catch (error) {
        console.error("Error adding announcement:", error);
        res.status(500).json({ message: 'Server error while adding announcement.', error: error.message });
    }
};

export const editAnnouncement = async (req, res) => {
    try {
        const { eventId, announcementId } = req.params;
        const { message, title, date, time } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Announcement message is required." });
        }

        // 1. Construct the path to the specific announcement in the array
        const updatePath = `announcements.$[elem]`;

        // 2. Find the event and update the specific subdocument
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $set: {
                    // Update fields of the element matched by the arrayFilter below
                    [updatePath]: {
                        title: title,
                        message: message,
                        date: date,
                        time: time,
                        author: req.user._id, // Keep current author or update if leader edited
                    },
                },
            },
            {
                new: true,
                runValidators: true,
                // ArrayFilter ensures we only update the subdocument whose _id matches announcementId
                arrayFilters: [{ 'elem._id': announcementId }] 
            }
        ).select('announcements');

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event or Announcement not found." });
        }

        const editedAnnouncement = updatedEvent.announcements.find(ann => ann._id.toString() === announcementId);
        
        res.status(200).json({ 
            message: "Announcement updated successfully.",
            announcement: editedAnnouncement
        });

    } catch (error) {
        console.error("Error editing announcement:", error);
        res.status(500).json({ message: 'Server error while editing announcement.', error: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { eventId, announcementId } = req.params;

        // 1. Find the event and remove the subdocument matching the announcementId
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: { // $pull removes elements from an array that match a condition
                    announcements: { _id: announcementId }
                }
            },
            { new: true } // Return the updated document
        ).select('announcements');

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({ 
            message: "Announcement deleted successfully.",
            announcements: updatedEvent.announcements
        });

    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: 'Server error while deleting announcement.', error: error.message });
    }
};