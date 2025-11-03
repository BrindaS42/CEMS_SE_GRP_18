import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";

// ✅ Organizer: update registration status (approve/reject)
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    registration.status = status;
    if (status === "confirmed") registration.paymentStatus = "verified";

    await registration.save();
    res.status(200).json({ message: "Registration status updated", registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Organizer: get all registrations for a specific event
export const getRegistrationsByEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId });
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Organizer: get full event details
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
  }
};
