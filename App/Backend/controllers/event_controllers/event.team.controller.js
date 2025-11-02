import Team from "../../models/organizerTeam.model.js";
import User from "../../models/user.model.js";
import InboxEntity from "../../models/message.model.js";

export const createTeamForEvent = async (req, res) => {
  try {
    let {name, description} = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }
    name = name.trim();

    const leaderId = req.user.id;

    // Enforce unique team name (case-insensitive)
    const existing = await Team.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(409).json({ message: "Team name already exists" });
    }

    const team = await Team.create({ name, description, leader: leaderId, members: [] });

    res.status(201).json({ message: "Team created successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create team", error: err.message });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const teams = await Team.find({}, 'name leader createdAt');
    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve team list", error: err.message });
  }
};

export const getAllUserDetails = async (req, res) => {
  try {
    const users = await User.find({ role: { $eq: "organizer" } }, 'profile username email'); // Fetch only necessary fields
    return res.status(200).json(users);
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

    const existingInvitation = await InboxEntity.findOne({
      relatedTeam: teamId,
      to: userToInvite._id,
      status: "Pending",
      type: "team_invite"
    });
    
    if (existingInvitation) {
      return res.status(400).json({ message: "An invitation has already been sent to this user" });
    }

    const invitation = await InboxEntity.create({
      type: "team_invite",
      title: `Invitation to join team: ${team.name}`,
      description: `You have been invited to join ${team.name} as a ${role}.`,
      from: invitedBy,
      to: userToInvite._id,
      status: "Pending",
      relatedTeam: teamId,
      relatedTeamModel: "OrganizerTeam", 
      role: role || "volunteer",
    });

    res.status(201).json({ message: "Invitation sent successfully", invitation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send invitation", error: err.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, decision } = req.body;
    const userId = req.user.id;

    if (!invitationId || !decision || !["Approved", "Rejected"].includes(decision)) {
      return res.status(400).json({ message: "A valid invitationId and decision ('Approved' or 'Rejected') are required" });
    }

    const invitation = await InboxEntity.findOne({
      _id: invitationId,
      status: "Pending",
      type: "team_invite"
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or has already been addressed" });
    }

    if (invitation.to.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to respond to this invitation" });
    }

    invitation.status = decision;
    await invitation.save();

    if (decision === "Approved") {
      const team = await Team.findById(invitation.relatedTeam);
      if (team) {
        team.members.push({ user: userId, role: invitation.role || "volunteer" });
        await team.save();
      } else {
        console.error(`Team with id ${invitation.relatedTeam} not found after accepting invitation.`);
        return res.status(500).json({ message: `Invitation ${decision}, but failed to find associated team.` });
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
    const invitations = await InboxEntity.find({ 
      to: req.user.id, 
      status: "Pending",
      type: "team_invite"
    })
      .populate("relatedTeam", "name")
      .populate("from", "name username");

    res.status(200).json(invitations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve invitations", error: err.message });
  }
};

export const changeDescriptionOfTeam = async (req, res) => {
  try {
    const { teamId, newDescription } = req.body;
    const leaderId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can change the description" });
    }

    team.description = newDescription;
    await team.save();

    res.status(200).json({ message: "Team description updated successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update team description", error: err.message });
  }
};

export const removeTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const leaderId = req.user.id;
    
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can delete the team" });
    }
    

    await Team.findByIdAndDelete(teamId);

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete team", error: err.message });
  }
};