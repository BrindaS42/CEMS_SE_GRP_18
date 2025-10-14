import crypto from "crypto";
import Team from "../../models/team.model.js";
import Invitation from "../../models/invitaion.model.js";
import User from "../../models/user.model.js";
import Message from "../../models/message.model.js";


export const createTeamForEvent = async (req, res) => {
  try {
    let {name} = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }
    name = name.trim();

    const leaderId = req.user.id;

    const team = await Team.create({ name, leader: leaderId, members: [] });

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
    const { username, role} = req.body;
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

export const respondToInvitation = async (req, res) => {
  try {
    const { token, decision } = req.body;
    const userId = req.user.id;

    if (!token || !decision || !["accepted", "declined"].includes(decision)) {
      return res.status(400).json({ message: "A valid token and decision ('accepted' or 'declined') are required" });
    }

    const invitation = await Invitation.findOne({ token, status: "pending" });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or has already been addressed" });
    }

    if (invitation.invitedUser.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to respond to this invitation" });
    }

    invitation.status = decision;
    await invitation.save();

    if (decision === "accepted") {
      const team = await Team.findById(invitation.teamId);
      if (team) {
        team.members.push({ user: userId, role: invitation.role || "volunteer" });
        await team.save();
      }
    }

    res.status(200).json({ message: `Invitation ${decision} successfully`, invitation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to respond to invitation", error: err.message });
  }
};

export const removeMemberFromTeam = async (req, res) => {
  try {
    const { teamId, memberId } = req.body;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can remove members" });
    }

    team.members = team.members.filter(member => member.user.toString() !== memberId);
    await team.save();

    res.status(200).json({ message: "Member removed successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove member", error: err.message });
  }
};

export const changeMemberRole = async (req, res) => {
  try {
    const { teamId, memberId, newRole } = req.body;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can change roles" });
    }

    const member = team.members.find(member => member.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found in this team" });
    }

    if(["co-organizer", "volunteer", "editor"].includes(newRole)) {
        member.role = newRole;
        await team.save();
        res.status(200).json({ message: "Member role updated successfully", team });
    } else {
        res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update member role", error: err.message });
  }
};

export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate("leader", "name username").populate("members.user", "name username");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve team details", error: err.message });
  }
};

export const getUserInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedUser: req.user.id, status: "pending" })
      .populate("teamId", "name")
      .populate("invitedBy", "name");

    res.status(200).json(invitations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve invitations", error: err.message });
  }
};