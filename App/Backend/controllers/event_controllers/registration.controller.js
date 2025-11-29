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
    const { eventId, teamName, paymentProof, registrationData, comboId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    let teamId = null;

    if (event.config.registrationType === 'Team') {
      if (!teamName) {
        return res.status(400).json({ success: false, message: "Team name is required for this event." });
      }
      const team = await StudentTeam.findOne({ teamName: teamName });
      if (!team) {
        return res.status(404).json({ success: false, message: `Team with name "${teamName}" not found.` });
      }
      if (team.leader.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Only the designated team leader can submit the registration." });
      }
      teamId = team._id;
    }

    if (teamId) {
      const team = await StudentTeam.findById(teamId).lean();
      const memberIds = team.members ? team.members.map(m => m.member) : []; 
      memberIds.push(team.leader);
      const existingRegistration = await Registration.findOne({ eventId, userId: { $in: memberIds } });
      if (existingRegistration) {
        return res.status(400).json({ success: false, message: "A member of your team is already registered for this event." });
      }
    } else {
      const existing = await Registration.findOne({ eventId, userId: req.user.id });
      if (existing) return res.status(400).json({ success: false, message: "You are already registered for this event." });
    }

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const checkIns = (event.timeline || []).map((t) => ({
      timelineRef: t._id,
      checkedInAt: null,
      status: "absent",
    }));

    let finalFee = event.config.fees;
    let selectedCombo = null;

    if (comboId) {
      selectedCombo = event.config.combos.id(comboId);
      if (!selectedCombo) {
        return res.status(400).json({ success: false, message: "Invalid combo plan selected." });
      }
      finalFee = selectedCombo.fees;
    }

    let paymentStatus = "not_required";
    let status = "confirmed";

    if (finalFee > 0) {
      if (!paymentProof) {
         return res.status(400).json({ success: false, message: "Payment proof is required for paid events." });
      }

      paymentStatus = "pending";
      status = "pending";

      const team = await Team.findById(event.createdBy).lean();
      let notificationRecipients = [];
      if (team) {
        notificationRecipients.push(team.leader);
        if(team.members) {
            team.members.forEach(member => notificationRecipients.push(member.member));
        }
      }

      await notify({
        type: "registration_approval_request",
        from: req.user.id,
        to: notificationRecipients,
        eventId,
        title: `Registration approval required for ${event.title}`,
        description: `New registration (${selectedCombo ? selectedCombo.title : 'Standard'}). Payment of ₹${finalFee} needs verification.\n\nPayment Proof: ${paymentProof}`,
        role: "Organizer",
      });
    }

    // Create Registration
    const registration = await Registration.create({
      eventId,
      userId: req.user.id,
      teamName: teamId,
      paymentProof,
      registrationData,
      paymentStatus,
      status,
      checkInCode,
      checkIns,
      comboId: selectedCombo ? selectedCombo._id : null, 
      amountPaid: finalFee 
    });

    if (finalFee === 0 || paymentStatus === "not_required") {
      event.registrations.push(registration._id);
      await event.save();
      await notify({
        type: "announcement",
        from: event.createdBy,
        to: [req.user.id],
        eventId,
        title: `Registration Successful for ${event.title}`,
        description: `🎉 You have successfully registered for "${event.title}". Your check-in code is: ${checkInCode}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit registration", error: error.message });
  }
};


export const getRegistrationStatusByEIDPID = async (req, res) => {
  try {
    const { eventId, participantId } = req.params;

    let registration = await Registration.findOne({ eventId, userId: participantId });

    if (!registration) {
      const userTeams = await StudentTeam.find({
        "members.member": participantId,
        "members.status": "Approved"
      }).select("_id");

      if (userTeams.length > 0) {
        const teamIds = userTeams.map(t => t._id);
        
        registration = await Registration.findOne({
          eventId,
          teamId: { $in: teamIds }
        });
      }
    }

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
        const teams = await StudentTeam.find({ leader: studentId }).select('_id teamName members'); // Select relevant fields
        console.log("✅ Fetched student teams:", teams);
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
      return res.status(404).json({ success: false, message: "Timeline event not found for this registration." });
    }

    await registration.save();
    res.status(200).json({ success: true, message: "Check-in marked successfully", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark check-in", error: error.message });
  }
};