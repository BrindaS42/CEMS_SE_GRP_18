import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";

/**
 * @desc Register a user for an event
 * @route POST /api/registrations
 * @access Student only
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, teamName, members, paymentProof, registrationData } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Check if already registered
    const already = await Registration.findOne({ eventId, userId: req.user._id });
    if (already) return res.status(400).json({ error: "Already registered for this event" });

    // Generate a unique check-in code
    const checkInCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Setup check-in timelines
    const checkIns =
      event.timelines?.map((t) => ({
        timelineTitle: t.title,
        status: "absent",
      })) || [];

    // Set payment + registration status
    let paymentStatus = "not_required";
    let status = "confirmed";

    if (event.isPaid) {
      paymentStatus = "pending";
      status = "pending";
    }

    // Create new registration
    const registration = await Registration.create({
      eventId,
      userId: req.user._id,
      teamName,
      members,
      paymentProof,
      registrationData, // store the answers here
      paymentStatus,
      status,
      checkInCode,
      checkIns,
    });

    res.status(201).json({
      message: "Registration successful",
      registration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Get registration configurations (questions) for a given event
 * @route GET /api/registrations/config/:eventId
 * @access Public
 */
export const getRegistrationConfig = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("config");
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.status(200).json({
      message: "Registration configuration retrieved successfully",
      config: event.config || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
