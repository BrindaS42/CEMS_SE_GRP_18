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


export const submitRegistration = async (req, res) => {
  try {
    const { eventId, teamName, paymentProof, registrationData } = req.body;
    
    // 1. Validate Event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    let teamId = null;

    // 2. Team Logic
    if (event.config.registrationType === 'Team') {
      if (!teamName) {
        return res.status(400).json({ success: false, message: "Team name is required for this event." });
      }

      // Find the team
      const team = await StudentTeam.findOne({ teamName: teamName });
      
      if (!team) {
        return res.status(404).json({ success: false, message: `Team with name "${teamName}" not found.` });
      }

      // Check leadership
      if (team.leader.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Only the designated team leader can submit the registration." });
      }
      
      teamId = team._id;
    }

    // 3. Duplicate Registration Check
    if (teamId) {
      // Team check: Check if any member of this team is already associated with a registration for this event
      const team = await StudentTeam.findById(teamId).lean();
      
      // Get all member IDs including leader
      const memberIds = team.members ? team.members.map(m => m.member) : []; 
      memberIds.push(team.leader);

      // Check if any of these users have already registered (either individually or as leader of another team)
      // Note: This is a basic check. A more robust check would query if these users are part of *any* registered team.
      const existingRegistration = await Registration.findOne({ eventId, userId: { $in: memberIds } });
      
      if (existingRegistration) {
        return res.status(400).json({ success: false, message: "A member of your team is already registered for this event." });
      }
    } else {
      // Individual check
      const existing = await Registration.findOne({ eventId, userId: req.user.id });
      if (existing) return res.status(400).json({ success: false, message: "You are already registered for this event." });
    }

    const checkInCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const checkIns = (event.timeline || []).map((t) => ({
      timelineRef: t._id,
      checkedInAt: null,
      status: "absent",
    }));

    let paymentStatus = "not_required";
    let status = "confirmed";

    // 4. Payment Logic
    if (event.config?.fees > 0) {
      // Validation: Ensure payment proof exists if fees > 0
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
        description: `A new participant has registered and payment proof needs verification.`,
        role: "Organizer",
      });
    }

    // 5. Create Registration
    const registration = await Registration.create({
      eventId,
      userId: req.user.id,       // ✅ Save the ObjectId reference to the team
      teamName: teamId,   // ✅ Save the String name of the team
      paymentProof,
      registrationData,
      paymentStatus,
      status,
      checkInCode,
      checkIns,
    });

    if (event.config.fees === 0 || paymentStatus === "not_required") {
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

    // 1. Direct Check: Check if the user registered directly (Individual or as Team Leader)
    let registration = await Registration.findOne({ eventId, userId: participantId });

    // 2. Member Check: If direct registration not found, check if user is a member of a registered team
    if (!registration) {
      // Find all teams where this user is an 'Approved' member
      const userTeams = await StudentTeam.find({
        "members.member": participantId,
        "members.status": "Approved"
      }).select("_id");

      if (userTeams.length > 0) {
        const teamIds = userTeams.map(t => t._id);
        
        // Check if any of those teams have a registration for this event
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
        // Fetch teams where the student is the leader, as only leaders can register.
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