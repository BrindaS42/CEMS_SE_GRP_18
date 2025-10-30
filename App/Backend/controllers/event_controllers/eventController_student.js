import Event from "../../models/event.model.js";
import Registration from "../../models/registration.model.js";


/**
 * @desc Get full event details by ID (no populate, return everything)
 * @route GET /api/events/:id
 * @access Public
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event); // send entire event object
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Mark a participant as checked in using checkInCode and timelineId
 * @route POST /api/events/:eventId/checkin
 * @access Organizer only
 */
export const markCheckIn = async (req, res) => {
  try {
    const { checkInCode, timelineId } = req.body;

    if (!checkInCode || !timelineId) {
      return res.status(400).json({ error: "Check-in code and timeline ID are required" });
    }

    // Find registration with given code and event
    const registration = await Registration.findOne({
      eventId: req.params.eventId,
      checkInCode,
    });

    if (!registration) {
      return res.status(404).json({ error: "No registration found for this check-in code" });
    }

    // Find or create check-in record for this timeline
    let checkIn = registration.checkIns.find(
      (c) => String(c.timelineId) === String(timelineId)
    );

    if (!checkIn) {
      checkIn = { timelineId, status: "present", checkInTime: new Date() };
      registration.checkIns.push(checkIn);
    } else {
      checkIn.status = "present";
      checkIn.checkInTime = new Date();
    }

    registration.checkIn = true;
    await registration.save();

    res.status(200).json({ message: "Check-in marked successfully", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
