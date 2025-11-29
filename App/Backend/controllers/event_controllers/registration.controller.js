import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import InboxEntity from "../../models/inbox.model.js";
import crypto from "crypto";
import StudentTeam from "../../models/studentTeam.model.js";
import Team from "../../models/organizerTeam.model.js";

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


// registration.controller.js

export const submitRegistration = async (req, res) => {
  try {
    const { eventId, teamName, paymentProof, registrationData } = req.body;
    const event = await Event.findById(eventId);
    
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    let teamId = null;
    if (event.config.registrationType === 'Team') {
      if (!teamName) {
        return res.status(400).json({ success: false, message: "Team name is required for this event." });
      }
      
      // FIX: Find the team by its name field (string), not its ID
      const team = await StudentTeam.findOne({ name: teamName });
        
      if (!team) {
        console.log("Team not found or unauthorized");
        return res.status(404).json({ success: false, message: `Team with name "${teamName}" not found.` });
      }
      
      // SECURITY CHECK: Ensure the currently logged-in user is the team leader
      if (team.leader.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Only the designated team leader can submit the registration." });
      }

      teamId = team._id;
    }

    if (teamId) {
      // If team registration, check if any member is already registered
      const team = await StudentTeam.findById(teamId).lean();
      const memberIds = team.members.map(m => m.member.toString());
      memberIds.push(team.leader.toString());

      const existingRegistration = await Registration.findOne({ 
        eventId, 
        userId: { $in: memberIds },
      });
      
      if (existingRegistration) {
        return res.status(400).json({ success: false, message: "A member of your team is already registered for this event." });
      }
    } else {
      // Individual registration check
      const existing = await Registration.findOne({ eventId, userId: req.user.id });
      if (existing) return res.status(400).json({ success: false, message: "You are already registered for this event." });
    }

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const checkIns = (event.timeline || []).map((t) => ({
      timelineRef: t._id,
      checkedInAt: null,
      status: "absent",
    }));

    let paymentStatus = event.config?.fees > 0 ? "pending" : "not_required";
    let status = event.config?.fees > 0 ? "pending" : "confirmed";


    if (paymentStatus === "pending") {
      // Find the organizer team to notify the leader and members
      const team = await Team.findById(event.createdBy).lean();
      let notificationRecipients = [];
      if (team) {
        notificationRecipients.push(team.leader);
        team.members.forEach(member => notificationRecipients.push(member.member));
      }

      await notify({
        type: "registration_approval_request",
        from: req.user.id,
        to: notificationRecipients, 
        eventId,
        title: `Registration approval required for ${event.title}`,
        description: `A new participant has registered and payment proof needs verification. \n Payment proof link: ${paymentProof || 'N/A'}`,
        role: "Organizer",
      });
    }
  

    const registration = await Registration.create({
      eventId,
      userId: req.user.id,
      teamName: teamId, // Use the actual teamId if it was a team registration
      paymentProof,
      registrationData,
      paymentStatus,
      status,
      checkInCode,
      checkIns,
    });

    if (status === "confirmed") {
      // Only push to event.registrations if status is confirmed (no payment/auto-approved)
      event.registrations.push(registration._id);
      await event.save();
      
      await notify({
        type: "announcement",
        from: event.createdBy,
        to: [req.user.id],
        eventId,
        title: `Registration Successful for ${event.title}`,
        description: `🎉 You have successfully registered for "${event.title}". Your check-in code is: ${checkInCode}`,
        role: "Student",
      });
    }

    res.status(201).json({
      success: true,
      message: paymentStatus === "pending" 
        ? "Registration submitted successfully. Awaiting payment verification."
        : "Registration submitted and confirmed successfully.",
      registration,
    });
  } catch (error) {
    console.error("Registration submission failed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit registration due to a server error.", 
      error: error.message 
    });
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



export const getStudentTeams = async (req, res) => {
    try {
        const studentId = req.user.id;
        // Fetch teams where the student is the leader OR a member
        const teams = await StudentTeam.find({
            $or: [
                { leader: studentId },
                { 'members.member': studentId, 'members.status': 'Approved' }
            ]
        }).select('_id name'); // Select only ID and name

        res.status(200).json({
            success: true,
            teams,
        });
    } catch (error) {
        console.error("❌ Failed to fetch student teams:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch student teams", error: error.message });
    }
};

  export const markCheckIn = async (req, res) => {
    try {
      const { checkInCode, timelineRef } = req.body;
      const registration = await Registration.findOne({ checkInCode });
      if (!registration) return res.status(404).json({ success: false, message: "Invalid check-in code" });

      const checkIn = registration.checkIns.find(c => c.timelineRef.toString() === timelineRef);
      if (checkIn) {
        checkIn.status = "present";
        checkIn.checkedInAt = new Date();
      } else {
        // This case should ideally not happen if check-ins are pre-created on registration
        // but as a fallback:
        return res.status(404).json({ success: false, message: "Timeline event not found for this registration." });
      }

      await registration.save();
      res.status(200).json({ success: true, message: "Check-in marked successfully", registration });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to mark check-in", error: error.message });
    }
  };