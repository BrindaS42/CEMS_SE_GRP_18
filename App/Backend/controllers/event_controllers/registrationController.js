import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import crypto from "crypto";
import Message from "../../models/message.model.js";

const notifyStudent = async (senderId, receiverId, eventId, eventTitle, checkInCode) => {
  try {
    await Message.create({
      sender: senderId,
      receiver: receiverId,
      event: eventId,
      subject: `Registration Successful for ${eventTitle}`,
      message: `🎉 You have successfully registered for "${eventTitle}". Your check-in code is: ${checkInCode}`,
      type: "announcement",
    });
  } catch (err) {
    console.error("❌ Failed to send registration notification:", err.message);
  }
};


export const getRegistrationForm = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("title config deadline");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({
      success: true,
      eventTitle: event.title,
      deadline: event.deadline,
      registrationConfig: event.config || {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registration form", error: error.message });
  }
};


export const submitRegistration = async (req, res) => {
  try {
    const { eventId, teamName, members, paymentProof, registrationData } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    
    if (event.deadline && new Date() > new Date(event.deadline)) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }

    
    const existing = await Registration.findOne({ eventId, userId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: "Already registered for this event" });

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    
    const checkIns =
      (event.timelines || []).map((t) => ({
        timelineTitle: t.title,
        status: "absent",
      })) || [];

    
    let paymentStatus = "not_required";
    let status = "confirmed";

    if (event.isPaid) {
      paymentStatus = "pending";
      status = "pending";
    }

    const registration = await Registration.create({
      eventId,
      userId: req.user._id,
      teamName,
      members,
      paymentProof,
      registrationData,
      paymentStatus,
      status,
      checkInCode,
      checkIns,
    });
    await notifyStudent(req.user._id, req.user._id, event.title, checkInCode);

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

    if (!registration)
      return res.status(404).json({ success: false, message: "Registration not found" });

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
    const { checkInCode, timelineTitle } = req.body;
    const registration = await Registration.findOne({ checkInCode });
    if (!registration) return res.status(404).json({ success: false, message: "Invalid check-in code" });

    const checkIn = registration.checkIns.find(c => c.timelineTitle === timelineTitle);
    if (checkIn) {
      checkIn.status = "present";
      checkIn.checkInTime = new Date();
    } else {
      registration.checkIns.push({ timelineTitle, status: "present", checkInTime: new Date() });
    }

    await registration.save();
    res.status(200).json({ success: true, message: "Check-in marked successfully", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark check-in", error: error.message });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "pending"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    registration.status = status;
    if (status === "confirmed") registration.paymentStatus = "verified";

    await registration.save();
    res.status(200).json({ success: true, message: "Status updated", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};

export const getRegistrationConfig = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("config title");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({
      success: true,
      message: "Registration configuration retrieved successfully",
      eventTitle: event.title,
      config: event.config || {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registration config", error: error.message });
  }
};

export const updateRegistrationConfig = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { config } = req.body;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { config },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    res.status(200).json({
      success: true,
      message: "Registration configuration updated successfully",
      config: event.config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update registration config", error: error.message });
  }
};
