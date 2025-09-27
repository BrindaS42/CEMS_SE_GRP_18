import crypto from "crypto";
import Team from "../../models/team.model.js";
import Invitation from "../../models/invitaion.model.js";
import Event from "../../models/event.model.js";
import User from "../../models/user.model.js";
import Message from "../../utils/message.util.js";


export const createTeamForEvent = async (req, res) => {
  try {
    const { eventId, name } = req.body;
    const leaderId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.team) {
        return res.status(409).json({ message: "This event already has a team." });
    }


    const team = await Team.create({ name, leader: leaderId, members: [] });
    event.team = team._id;
    await event.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create team", error: err.message });
  }
};

export const getAllUserDetails = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "organizer" } }, 'profile username email'); // Fetch only necessary fields
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve users", error: err.message });
  }
};

export const inviteMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { username, role, eventId } = req.body;
    const invitedBy = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== invitedBy.toString()) {
      return res.status(403).json({ message: "Only the team leader can send invitations" });
    }

    const userToInvite = await User.findOne({ username });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this username not found" });
    }

    if (userToInvite._id.toString() === invitedBy.toString()) {
       return res.status(400).json({ message: "You cannot invite yourself to the team." });
    }

    const isAlreadyMember = team.members.some(member => member.user.toString() === userToInvite._id.toString());
    if (isAlreadyMember) {
      return res.status(400).json({ message: "User is already a member of this team" });
    }

    const existingInvitation = await Invitation.findOne({ teamId, invitedUser: userToInvite._id, status: "pending" });
    if (existingInvitation) {
      return res.status(400).json({ message: "An invitation has already been sent to this user" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const invitation = await Invitation.create({
      teamId,
      invitedBy,
      invitedUser: userToInvite._id,
      status: "pending",
      token,
      role
    });

    await Message.create({
      sender: invitedBy,
      receiver: userToInvite._id,
      event: eventId,
      subject: `Invitation to join team: ${team.name}`,
      message: `You have been invited to join the team. Use this token to respond: ${token}`,
      type: "invitation",
    });

    res.status(201).json({ message: "Invitation sent successfully", invitation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send invitation", error: err.message });
  }
};
