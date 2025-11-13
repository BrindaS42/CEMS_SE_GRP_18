import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js"
import StudentTeam from "../../models/studentTeam.model.js";

export const FetchTheListOfRegisteredEventsByPID = async ( req , res ) => {
    try {
        const userId = req.user.id;
        const allRegistrations = await Registration.find({student:userId}).populate({
            path: "eventId", 
            match: {
                status: "Published"
            }
        });

        const eventList = allRegistrations.filter(registration => registration.eventId !== null);
        
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
        const allRegistrations = await Registration.find({student:userId}).populate({
            path: "eventId", 
            match: {
                status: "Completed"
            }
        });

        const eventList = allRegistrations.filter(registration => registration.eventId !== null);
        
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);

        const query = {
            status: "Published",
            
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
            .sort({ publishedAt: -1 });

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


export const GetClashDetectionWarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await Registration.find({ studentId: userId }).populate({
      path: "eventId",
      match: { status: "Published" },
      select: "title timeline",
    });

    const timeSlots = [];

    registrations.forEach((reg) => {
      if (!reg.eventId) return;

      const event = reg.eventId;

      event.timeline.forEach((entry) => {
        if (entry.duration && entry.duration.from && entry.duration.to) {
          timeSlots.push({
            eventId: event._id,
            eventTitle: event.title,
            timelineTitle: entry.title || "Event Period",
            startTime: new Date(entry.duration.from),
            endTime: new Date(entry.duration.to),
          });
        }
      });
    });

    const clashes = [];

    for (let i = 0; i < timeSlots.length; i++) {
      const slotA = timeSlots[i];

      for (let j = i + 1; j < timeSlots.length; j++) {
        const slotB = timeSlots[j];

        const isOverlap =
          slotA.startTime <= slotB.endTime && slotB.startTime <= slotA.endTime;

        if (isOverlap && slotA.eventId.toString() !== slotB.eventId.toString()) {
          clashes.push({
            message: `CLASH DETECTED: Your event "${slotA.eventTitle}" (${slotA.timelineTitle}) conflicts with "${slotB.eventTitle}" (${slotB.timelineTitle}).`,
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

    if (clashes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No schedule clashes found in your registered events.",
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


export const getStudentTeams = async (req, res) => {
  try {
    const studentId = req.user.id;


    const teams = await StudentTeam.find({
    $or: [
        { leader: studentId },
        { members: { $elemMatch: { member: studentId } } }
    ]
    })
    .populate("leader", "name email")
    .populate("members.member", "name email")
    .select("name leader members");

    if (!teams || teams.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You are not currently part of any teams.",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved your teams.",
      count: teams.length,
      data: teams,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving teams.",
      error: err.message,
    });
  }
};