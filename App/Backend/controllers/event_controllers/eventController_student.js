import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import crypto from "crypto";

// ✅ Register a student for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, teamName, members, paymentProof } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const already = await Registration.findOne({ eventId, userId: req.user._id });
    if (already) return res.status(400).json({ error: "Already registered for this event" });

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    // initialize timeline check-ins as "absent"
    const checkIns = (event.timeline || []).map((t) => ({
      timelineId: t._id,
      status: "absent",
    }));

    const isPaidEvent = event.isPaid || false;
    const registration = await Registration.create({
      eventId,
      userId: req.user._id,
      teamName,
      members,
      paymentProof,
      paymentStatus: isPaidEvent ? "pending" : "not_required",
      status: isPaidEvent ? "pending" : "confirmed",
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

// ✅ Mark check-in by organizer scanning code
export const markCheckIn = async (req, res) => {
  try {
    const { checkInCode, timelineId } = req.body;

    const registration = await Registration.findOne({ checkInCode });
    if (!registration) return res.status(404).json({ message: "Invalid check-in code" });

    const checkInEntry = registration.checkIns.find(
      (c) => c.timelineId.toString() === timelineId
    );
    if (!checkInEntry) return res.status(404).json({ message: "Timeline not found" });

    checkInEntry.status = "present";
    checkInEntry.checkInTime = new Date();
    registration.checkIn = true;

    await registration.save();
    res.status(200).json({ message: "Check-in marked successfully", registration });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark check-in", error: err.message });
  }
};
