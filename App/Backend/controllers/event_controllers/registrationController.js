import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";

/**
 * @desc Register a user for an event
 * @route POST /api/registrations
 * @access Student only
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, teamName, members, paymentProof } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if already registered
    const already = await Registration.findOne({ eventId, userId: req.user._id });
    if (already) {
      return res.status(400).json({ error: "Already registered for this event" });
    }

    // Generate a unique check-in code
    const checkInCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Set payment + registration status
    let paymentStatus = "not_required";
    let status = "confirmed";

    if (event.isPaid) {
      paymentStatus = "pending";
      status = "pending";
    } else {
      paymentStatus = "not_required";
      status = "confirmed";
    }

    const registration = await Registration.create({
      eventId,
      userId: req.user._id,
      teamName,
      members,
      paymentProof,
      paymentStatus,
      status,
      checkInCode,
      checkIns: [],
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
 * @desc Approve or reject registration
 * @route PUT /api/registrations/:id/status
 * @access Organizer only
 */
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    registration.status = status;

    // if confirmed, mark payment verified
    if (status === "confirmed") {
      registration.paymentStatus = "verified";
    }

    await registration.save();

    res.status(200).json({ message: "Registration status updated", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Get all registrations for a specific event
 * @route GET /api/registrations/event/:eventId
 * @access Organizer only
 */
export const getRegistrationsByEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId });
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
