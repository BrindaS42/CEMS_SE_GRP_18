import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js"
import StudentTeam from "../../models/studentTeam.model.js";

const getStudentEventIds = async (userId) => {
  // Find teams where the user is a leader or an approved member
  const userTeams = await StudentTeam.find({
    $or: [
      { leader: userId },
      { members: { $elemMatch: { member: userId, status: 'Approved' } } }
    ]
  }).select('_id');
  const teamIds = userTeams.map(t => t._id);

  // Find registrations for the user directly or for any of their teams
  const registrations = await Registration.find({
    $or: [
      { userId: userId },
      { teamName: { $in: teamIds } }
    ]
  }).select('eventId');

  return registrations.map(r => r.eventId);
};

export const FetchTheListOfRegisteredEventsByPID = async ( req , res ) => {
    try {
        const userId = req.user.id;
        const eventIds = await getStudentEventIds(userId);

        const eventList = await Event.find({
            _id: { $in: eventIds },
            status: 'published'
        }).lean();
        return res.status(200).json({
            success: true,
            message: "Successfully fetched registered events.",
            count: eventList.length,
            data: eventList
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching registered events.",
            error: err.message
        });
    }
};

export const FetchTheListOfCompletedEventsByPID = async ( req , res ) => {
    try {
        const userId = req.user.id;
        const eventIds = await getStudentEventIds(userId);

        const eventList = await Event.find({
            _id: { $in: eventIds },
            status: "completed"
        }).lean();
        
        return res.status(200).json({
            success: true,
            message: "Successfully fetched registered events.",
            count: eventList.length,
            data: eventList
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching registered events.",
            error: err.message
        });
    }
};

export const GetTheTimeLineReminders = async(req , res) => {
    try{
        const userId = req.user.id;
        const eventIds = await getStudentEventIds(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);

        const query = {
            _id: { $in: eventIds },
            status: "published",
            
            timeline: {
                $elemMatch: {
                    $or: [
                        { date: { $gte: today, $lte: oneWeekFromNow } },
                        { "duration.from": { $gte: today, $lte: oneWeekFromNow } }
                    ]
                }
            }
        };

        const eventList = await Event.find(query)
            .select("title description posterUrl categoryTags timeline")
            .sort({ publishedAt: -1 })
            .lean();

        if (eventList.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No upcoming events found for this week.",
                count: 0,
                data: []
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Successfully fetched upcoming events.",
            count: eventList.length,
            data: eventList
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching upcoming events.",
            error: err.message
        });
    }
};


const createDateTime = (baseDate, timeStr) => {
  if (!baseDate || !timeStr) return null;
  
  // Create a fresh Date object from the base date
  const d = new Date(baseDate);
  
  // Extract Hours and Minutes from "HH:mm" string
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return null;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const GetClashDetectionWarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventIds = await getStudentEventIds(userId);
    
    // Fetch registered events
    const registeredEvents = await Event.find({ 
        _id: { $in: eventIds }, 
        status: 'published' 
    }).select("title timeline").lean();

    const timeSlots = [];

    registeredEvents.forEach((event) => {
      if (event.timeline && Array.isArray(event.timeline)) {
        event.timeline.forEach((entry) => {
          // Check if we have the necessary data: Date AND Time strings
          if (entry.date && entry.duration && entry.duration.from && entry.duration.to) {
            
            // FIX: Combine the Date + Time String
            const startObj = createDateTime(entry.date, entry.duration.from);
            const endObj = createDateTime(entry.date, entry.duration.to);

            // Handle overnight events (e.g., Starts 11 PM, Ends 1 AM next day)
            if (endObj < startObj) {
               endObj.setDate(endObj.getDate() + 1);
            }

            if (startObj && endObj) {
              timeSlots.push({
                eventId: event._id.toString(),
                eventTitle: event.title,
                timelineTitle: entry.title || "Event Period",
                startTime: startObj, // Now a valid Date object
                endTime: endObj,     // Now a valid Date object
              });
            }
          }
        });
      }
    });

    // Debug log to confirm dates are now valid
    console.log("All Time Slots Collected:", timeSlots.map(t => ({
        title: t.eventTitle,
        start: t.startTime.toLocaleString(),
        end: t.endTime.toLocaleString()
    })));

    const clashes = [];

    // Compare logic
    for (let i = 0; i < timeSlots.length; i++) {
      const slotA = timeSlots[i];

      for (let j = i + 1; j < timeSlots.length; j++) {
        const slotB = timeSlots[j];

        // Strict Overlap Check
        const isOverlap = slotA.startTime < slotB.endTime && slotB.startTime < slotA.endTime;

        if (isOverlap) {
            // Ensure we are comparing different events
            if (slotA.eventId !== slotB.eventId) {
              clashes.push({
                message: `CLASH DETECTED: "${slotA.eventTitle}" (${slotA.timelineTitle}) overlaps with "${slotB.eventTitle}"`,
                eventA: {
                  title: slotA.eventTitle,
                  timeline: slotA.timelineTitle,
                  starts: slotA.startTime,
                  ends: slotA.endTime,
                },
                eventB: {
                  title: slotB.eventTitle,
                  timeline: slotB.timelineTitle,
                  starts: slotB.startTime,
                  ends: slotB.endTime,
                },
              });
            }
        }
      }
    }
    console.log(`Total Clashes Found: ${clashes.length}`);
    if (clashes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No schedule clashes found.",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Warning: ${clashes.length} schedule clash(es) detected.`,
      count: clashes.length,
      data: clashes,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error while detecting schedule clashes.",
      error: err.message,
    });
  }
};