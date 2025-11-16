import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import InboxEntity from "../../models/inbox.model.js";
import crypto from "crypto";


const notify = async ({ type, from, to, eventId, title, description, role }) => {
  try {
    await InboxEntity.create({
      type,
      from,
      to,
      relatedEvent: eventId,
      title,
      description,
      status: "Pending",
      role,
    });
  } catch (err) {
    console.error("❌ Failed to create inbox notification:", err.message);
  }
};

// ✅ Fetch registration form config
export const getRegistrationForm = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("title config");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({
      success: true,
      eventTitle: event.title,
      registrationConfig: event.config || {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registration form", error: error.message });
  }
};


export const submitRegistration = async (req, res) => {
  try {
    const { eventId, team, paymentProof, registrationData } = req.body;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    const existing = await Registration.findOne({ eventId, userId: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: "Already registered" });

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const checkIns = (event.timeline || []).map((t) => ({
      timelineRef: t._id,
      checkedInAt: null,
      status: "absent",
    }));

    let paymentStatus = "not_required";
    let status = "confirmed";

    
    if (event.config?.fees > 0) {
      paymentStatus = "pending";
      status = "pending";

      await notify({
        type: "registration_approval",
        from: req.user.id,
        to: event.createdBy, // organizer team or user
        eventId,
        title: `Registration approval required for ${event.title}`,
        description: `A new participant has registered and payment proof needs verification.`,
        role: "Organizer",
      });
    }

    const registration = await Registration.create({
      eventId,
      userId: req.user.id,
      team,
      paymentProof,
      registrationData,
      paymentStatus,
      status,
      checkInCode,
      checkIns,
    });

    // Notify student about successful registration
    await notify({
      type: "announcement",
      from: event.createdBy,
      to: req.user.id,
      eventId,
      title: `Registration Successful for ${event.title}`,
      description: `🎉 You have successfully registered for "${event.title}". Your check-in code is: ${checkInCode}`,
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit registration", error: error.message });
  }
};


export const getRegistrationStatusByEIDPID = async (req, res) => {
  try {
    const { eventId, participantId } = req.params;
    const registration = await Registration.findOne({ eventId, userId: participantId });
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    res.status(200).json({
      success: true,
      registrationStatus: registration.status,
      paymentStatus: registration.paymentStatus,
      checkIns: registration.checkIns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registration status", error: error.message });
  }
};


export const markCheckIn = async (req, res) => {
  try {
    const { checkInCode, timelineRef } = req.body;
    const registration = await Registration.findOne({ checkInCode });
    if (!registration) return res.status(404).json({ success: false, message: "Invalid check-in code" });

    const checkIn = registration.checkIns.find(c => c.timelineRef === timelineRef);
    if (checkIn) {
      checkIn.status = "present";
      checkIn.checkedInAt = new Date();
    } else {
      registration.checkIns.push({ timelineRef, status: "present", checkedInAt: new Date() });
    }

    await registration.save();
    res.status(200).json({ success: true, message: "Check-in marked successfully", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark check-in", error: error.message });
  }
};