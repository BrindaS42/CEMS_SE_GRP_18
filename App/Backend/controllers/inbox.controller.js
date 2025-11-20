import InboxEntity from "../models/inbox.model.js";
import Event from "../models/event.model.js";
import Team from "../models/organizerTeam.model.js";
import StudentTeam from "../models/studentTeam.model.js";
import Registration from "../models/registration.model.js";
import User from "../models/user.model.js";

async function broadcastRecipients(keyword) {
  if (keyword === "to_allusers") {
    const users = await User.find().select("_id");
    return users.map((u) => u._id);
  }

  if (keyword === "to_all_student") {
    const users = await User.find({ role: "student" }).select("_id");
    return users.map((u) => u._id);
  }

  if (keyword === "to_all_organizer") {
    const users = await User.find({ role: "organizer" }).select("_id");
    return users.map((u) => u._id);
  }

  if (keyword === "to_all_sponsor") {
    const users = await User.find({ role: "sponsor" }).select("_id");
    return users.map((u) => u._id);
  }

  if (keyword.startsWith("to_college:")) {
    const collegeName = keyword.split(":")[1].trim();
    const college = await College.findOne({ name: collegeName });

    if (!college) throw new Error(`College '${collegeName}' not found`);

    const users = await User.find({ college: college._id }).select("_id");
    return users.map((u) => u._id);
  }

  return null;
}

export const createDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const {
      type,
      title,
      description,
      to,
      message,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
    } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: "Type and title are required" });
    }

    let toUserIds = [];

    if (to && Array.isArray(to) && to.length > 0) {
      const keyword = typeof to[0] === 'string' ? to[0] : null;
      const isBroadcastKeyword =
        keyword && (
          keyword === "to_allusers" ||
          keyword === "to_all_student" ||
          keyword === "to_all_organizer" ||
          keyword === "to_all_sponsor" ||
          keyword.startsWith("to_college:")
        );

      if (userRole === "admin" && isBroadcastKeyword) {
        toUserIds = await broadcastRecipients(keyword);
      } else {
        const findUserPromises = to.map(recipient => User.findOne({ email: recipient.email, role: recipient.role }).select('_id').lean());
        const users = await Promise.all(findUserPromises);
        toUserIds = users.filter(Boolean).map(user => user._id);
      }
    }

    const draft = await InboxEntity.create({
      type,
      title,
      description,
      from: userId,
      to: toUserIds,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
      status: "Draft",
    });

    const populatedDraft = await InboxEntity.findById(draft._id)
      .populate("from", "email profile.name")
      .populate("to", "email profile.name");

    res.status(201).json({
      success: true,
      message: "Draft created successfully",
      data: populatedDraft,
    });
  } catch (error) {
    console.error("createDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to create draft" });
  }
};

export const editDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { draftId } = req.params;

    const {
      type,
      title,
      description,
      to,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
    } = req.body;

    const draft = await InboxEntity.findById(draftId);
    if (!draft)
      return res.status(404).json({ success: false, error: "Draft not found" });

    if (draft.from.toString() !== userId)
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized to edit this draft" });

    if (draft.status !== "Draft")
      return res
        .status(400)
        .json({ success: false, error: "Only drafts can be edited" });

    let toUserIds = draft.to;

    if (to && Array.isArray(to) && to.length > 0) {
      const keyword = typeof to[0] === 'string' ? to[0] : null;
      const isBroadcastKeyword =
        keyword && (
          keyword === "to_allusers" ||
          keyword === "to_all_student" ||
          keyword === "to_all_organizer" ||
          keyword === "to_all_sponsor" ||
          keyword.startsWith("to_college:")
        );

      if (userRole === "admin" && isBroadcastKeyword) {
        toUserIds = await broadcastRecipients(keyword);
      } else {
        // 'to' is an array of {email, role} objects
        const findUserPromises = to.map(recipient =>
          User.findOne({ email: recipient.email, role: recipient.role }).select('_id').lean()
        );
        const users = await Promise.all(findUserPromises);
        toUserIds = users.filter(Boolean).map(user => user._id);
        if (toUserIds.length !== to.length) {
          console.warn("Some recipients were not found and were skipped during update.");
        }
      }
    }

    const updatedDraft = await InboxEntity.findByIdAndUpdate(
      draftId,
      {
        type: type || draft.type,
        title: title || draft.title,
        description: description || draft.description,
        to: toUserIds,
        relatedEvent: relatedEvent || draft.relatedEvent,
        relatedTeam: relatedTeam || draft.relatedTeam,
        relatedTeamModel: relatedTeamModel || draft.relatedTeamModel,
      },
      { new: true, runValidators: true }
    ).populate("from", "email profile.name")
      .populate("to", "email profile.name");

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      data: updatedDraft,
    });
  } catch (error) {
    console.error("editDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to update draft" });
  }
};

export const deleteDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { draftId } = req.params;

    const draft = await InboxEntity.findById(draftId);
    if (!draft)
      return res.status(404).json({ success: false, error: "Draft not found" });

    if (draft.from.toString() !== userId)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    await InboxEntity.findByIdAndDelete(draftId);

    res
      .status(200)
      .json({ success: true, message: "Draft deleted successfully" });
  } catch (error) {
    console.error("deleteDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to delete draft" });
  }
};

// Get List of Drafts
export const getListOfDrafts = async (req, res) => {
  try {
    const userId = req.user?.id;

    const drafts = await InboxEntity.find({ from: userId, status: "Draft" })
      .populate({
        path: "from",
        select: "email profile.name role",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate({
        path: "to",
        select: "email profile.name",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate("relatedEvent", "name description")
      .populate({
        path: "relatedTeam",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts,
    });
  } catch (error) {
    console.error("getListOfDrafts error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch drafts" });
  }
};

// Send Message (Change status from Draft to Sent)
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { draftId } = req.params;

    const draft = await InboxEntity.findById(draftId);
    if (!draft)
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });

    if (draft.from.toString() !== userId)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    // The latest 'to' list is sent in the body from the frontend.
    const { to } = req.body;
    if (!to || to.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Recipients are required" });

    const sentMessage = await InboxEntity.findByIdAndUpdate(
      draftId,
      { status: "Sent", to: draft.to }, // Keep existing to, or update if needed, but main check is on body
      { new: true }
    )
      .populate("from", "email profile.name")
      .populate("to", "email profile.name")
      .populate("relatedEvent", "name description")
      .populate({ path: "relatedTeam", select: "name" });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: sentMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const {
      type,
      title,
      description,
      to,
      message,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
    } = req.body;

    console.log("sendDirectMessage payload:", req.body);
    if (!type || !title)
      return res.status(400).json({ error: "Type and title are required" });

    if (!to || !Array.isArray(to) || to.filter(Boolean).length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Recipients required" });

    const keyword = typeof to[0] === 'string' ? to[0] : null;
    const isBroadcastKeyword =
      keyword && (
        keyword === "to_allusers" ||
        keyword === "to_all_student" ||
        keyword === "to_all_organizer" ||
        keyword === "to_all_sponsor" ||
        keyword.startsWith("to_college:")
      );

    let toUserIds = [];
      console.log("isBroadcastKeyword:", isBroadcastKeyword);
      console.log("userRole:", userRole);
      console.log("keyword:", keyword);
    if (userRole === "admin" && isBroadcastKeyword) {
      toUserIds = await broadcastRecipients(keyword);
    } else {
      // 'to' is an array of {email, role} objects
      const findUserPromises = to.map(recipient => User.findOne({ email: recipient.email, role: recipient.role }).select('_id').lean());
      const users = await Promise.all(findUserPromises);
      toUserIds = users.filter(Boolean).map(user => user._id);
    }

    const sentMessage = await InboxEntity.create({
      type,
      title,
      description,
      from: userId,
      to: toUserIds,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
      status: "Sent",
    });

    const populatedMessage = await InboxEntity.findById(sentMessage._id)
      .populate("from", "email profile.name")
      .populate("to", "email profile.name");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("sendDirectMessage error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

export const getListOfSents = async (req, res) => {
  try {
    const userId = req.user?.id;

    const sentMessages = await InboxEntity.find({
      from: userId,
      status: { $in: ["Sent", "Approved", "Rejected", "Pending"] },
    })
      .populate({
        path: "from",
        select: "email profile.name",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate({
        path: "to",
        select: "email profile.name",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate("relatedEvent", "name description")
      .populate({ path: "relatedTeam", select: "name" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sentMessages.length,
      data: sentMessages,
    });
  } catch (error) {
    console.error("getListOfSents error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch sent messages" });
  }
};

export const getListOfArrivals = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Find all inbox entities where the 'to' array contains the user's ID.
    // Using { to: userId } works, but { to: { $in: [userId] } } is more explicit for arrays.
    const arrivalMessages = await InboxEntity.find({ to: { $in: [userId] } })
      .populate({
        path: "from",
        select: "email profile.name",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate({
        path: "to",
        select: "email profile.name",
        transform: doc => doc || { profile: { name: '[Deleted User]' } }
      })
      .populate("relatedEvent", "name description")
      .populate({ path: "relatedTeam", select: "name" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: arrivalMessages.length,
      data: arrivalMessages,
    });
  } catch (error) {
    console.error("getListOfArrivals error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch arrival messages" });
  }
};

export const approveInboxEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const inbox = await InboxEntity.findById(id)
      .populate("relatedEvent", "_id title subEvents sponsors")
      .lean();

    if (!inbox) {
      return res.status(404).json({ message: "Inbox item not found" });
    }

    if (
      inbox.type === "message" ||
      inbox.type === "announcement"
    ) {
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });
      return res.status(200).json({
        success: true,
        message: `${inbox.type} approved successfully`,
      });
    }

    if (inbox.type === "subevent_invite") {
      const toUserId = inbox.to;
      const team = await Team.findOne({ leader: toUserId });
      if (!team) {
        return res
          .status(404)
          .json({ message: "No team found where recipient is leader" });
      }

      const subevent = await Event.findOne({ createdBy: team._id });
      const mainEvent = await Event.findById(inbox.relatedEvent);
      if (!mainEvent || !subevent) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!Array.isArray(mainEvent.subEvents)) mainEvent.subEvents = [];
      let index = mainEvent.subEvents.findIndex(
        (s) => s.subevent?.toString() === subevent._id.toString()
      );

      if (index === -1) {
        mainEvent.subEvents.push({
          subevent: subevent._id,
          status: "Approved",
        });
        index = mainEvent.subEvents.length - 1;
      } else {
        mainEvent.subEvents[index].status = "Approved";
      }

      await mainEvent.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Subevent invitation approved successfully",
        data: {
          mainEventId: mainEvent._id,
          subeventId: subevent._id,
          teamName: team.name,
          updatedSubevent: mainEvent.subEvents[index],
        },
      });
    }

    if (inbox.type === "sponsorship_request") {
      const sponsorId = inbox.to[0]; // The sponsor is the first recipient
      const eventId = inbox.relatedEvent;

      const event = await Event.findById(eventId);
      if (!event) {
        return res
          .status(404)
          .json({ message: "Event not found for sponsorship request" });
      }

      // Find the sponsor in the event's sponsors array and update their status
      const sponsorIndex = event.sponsors.findIndex(s => s.sponsor.toString() === sponsorId.toString());

      if (sponsorIndex !== -1) {
        event.sponsors[sponsorIndex].status = "Approved";
      } else {
        // Fallback: if sponsor isn't in the list, add them. This shouldn't happen in a normal flow.
        event.sponsors.push({ sponsor: sponsorId, status: "Approved" });
      }

      await event.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Sponsorship request approved successfully",
        // Return the full event object so the frontend can update its state
        event: event,
      });
    }

    if (inbox.type === "team_invite") {
      const teamId = inbox.relatedTeam;
      const newMemberId = inbox.to[0]; // The user who is accepting the invite

      if (inbox.relatedTeamModel === 'StudentTeam') {
        const studentTeam = await StudentTeam.findById(teamId);
        if (!studentTeam) return res.status(404).json({ message: "Student Team not found" });

        const memberIndex = studentTeam.members.findIndex(m => m.member.toString() === newMemberId.toString());

        if (memberIndex !== -1) {
          studentTeam.members[memberIndex].status = "Approved";
        } else {
          // Fallback: if user wasn't in members list, add them.
          studentTeam.members.push({ member: newMemberId, status: "Approved" });
        }

        await studentTeam.save();
        await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

        return res.status(200).json({
          success: true,
          message: "Successfully joined the student team",
          data: {
            teamId: studentTeam._id,
            teamName: studentTeam.teamName,
            members: studentTeam.members,
          },
        });

      } else if (inbox.relatedTeamModel === 'Team') {
        const organizerTeam = await Team.findById(teamId);
        if (!organizerTeam) return res.status(404).json({ message: "Organizer Team not found" });

        const memberIndex = organizerTeam.members.findIndex(m => m.user.toString() === newMemberId.toString());

        if (memberIndex !== -1) {
          organizerTeam.members[memberIndex].status = "Approved";
        } else {
          // Fallback: if user wasn't in members list, add them.
          organizerTeam.members.push({ user: newMemberId, role: inbox.role || 'volunteer', status: "Approved" });
        }

        await organizerTeam.save();
        await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

        return res.status(200).json({
          success: true,
          message: "Successfully joined the organizer team",
          data: {
            teamId: organizerTeam._id,
            teamName: organizerTeam.name,
            members: organizerTeam.members,
          },
        });
      } else {
        return res.status(400).json({ message: "Invalid team model for team invite." });
      }
    }

    if (inbox.type === "registration_approval_request") {
      const studentId = inbox.from?._id || inbox.from;
      const eventId = inbox.relatedEvent?._id || inbox.relatedEvent;

      const registration = await Registration.findOne({ studentId, eventId });
      if (!registration)
        return res.status(404).json({ message: "No registration found" });

      registration.paymentStatus = "verified";
      registration.status = "confirmed";
      await registration.save();

      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      const event = await Event.findById(eventId);
      const checkInCode = registration.checkInCode;
      await InboxEntity.create({
        type: "message",
        from: inbox.to,
        to: studentId,
        relatedEvent: eventId,
        title: `Registration Approved for ${event.title}`,
        description: `🎉 You have successfully registered for "${event.title}". Your check-in code is: ${checkInCode}`,
        status: "Sent",
      });
      return res.status(200).json({
        success: true,
        message: "Registration approved successfully",
        data: registration,
      });
    }

    await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });
    res.status(200).json({
      success: true,
      message: `${inbox.type} approved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve inbox",
      error: error.message,
    });
  }
};

export const rejectInboxEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const inbox = await InboxEntity.findById(id).lean();

    if (!inbox) {
      return res.status(404).json({ message: "Inbox item not found" });
    }

    // If it's a team invite rejection, remove the member from the team list
    if (inbox.type === "team_invite") {
      const teamId = inbox.relatedTeam;
      const memberIdToReject = inbox.to[0];

      if (inbox.relatedTeamModel === 'StudentTeam') {
        await StudentTeam.findByIdAndUpdate(teamId, {
          $pull: { members: { member: memberIdToReject } }
        });
      } else if (inbox.relatedTeamModel === 'Team') {
        await Team.findByIdAndUpdate(teamId, {
          $pull: { members: { user: memberIdToReject } }
        });
      }
    }

    await InboxEntity.findByIdAndUpdate(id, { status: "Rejected" });

    return res.status(200).json({
      success: true,
      message: `${inbox.type} rejected successfully`,
      data: { id: inbox._id, type: inbox.type },
    });

    inbox.status = "Rejected";
    await inbox.save();

    return res.status(200).json({
      success: true,
      message: `${inbox.type} rejected successfully`,
      data: { id: inbox._id, type: inbox.type },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject inbox item",
      error: error.message,
    });
  }
};
