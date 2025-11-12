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

export const updateTeam = async (req, res) => {
  try {
    // Get the ID from the URL parameters (better REST practice)
    const { teamId } = req.params; 
    const { name, description, membersToRemove, membersToUpdate } = req.body;
    const leaderId = req.user.id;

    // 1. Get and Authorize Team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can edit the team" });
    }

    let hasChanges = false;
    const validRoles = ["co-organizer", "volunteer", "editor"];

    // 2. Handle Name Change (if provided)
    if (name !== undefined) {
      const trimmedNewName = name.trim();
      if (trimmedNewName === "") {
        return res.status(400).json({ message: "Team name, if provided, cannot be empty" });
      }

      if (team.name.toLowerCase() !== trimmedNewName.toLowerCase()) {
        const existing = await Team.findOne({ name: trimmedNewName })
                                .collation({ locale: 'en', strength: 2 });
        if (existing) {
          return res.status(409).json({ message: "Team name already exists" });
        }
        team.name = trimmedNewName;
        hasChanges = true;
      }
    }

    // 3. Handle Description Change (if provided)
    if (description !== undefined) {
      if (team.description !== description) {
        team.description = description;
        hasChanges = true;
      }
    }

    // 4. Handle Members to Remove (if provided)
    if (membersToRemove && Array.isArray(membersToRemove)) {
      if (membersToRemove.includes(leaderId.toString())) {
        return res.status(400).json({ message: "The team leader cannot be removed" });
      }
      
      const originalCount = team.members.length;
      // Filter out members whose 'user' ID is in the membersToRemove array
      team.members = team.members.filter(member => !membersToRemove.includes(member.user.toString()));
      
      if (team.members.length < originalCount) {
        hasChanges = true;
      }
    }

    // 5. Handle Member Roles to Change (if provided)
    if (membersToUpdate && Array.isArray(membersToUpdate)) {
      for (const update of membersToUpdate) {
        const { memberId, newRole } = update;

        if (!memberId || !newRole) {
          return res.status(400).json({ message: "Invalid payload for membersToUpdate" });
        }
        if (!validRoles.includes(newRole)) {
          return res.status(400).json({ message: `Invalid role: ${newRole}` });
        }
        if (memberId === leaderId.toString()) {
          return res.status(400).json({ message: "Cannot change the leader's role" });
        }

        const member = team.members.find(m => m.user.toString() === memberId);
        if (!member) {
          return res.status(404).json({ message: `Member with ID ${memberId} not found in this team` });
        }

        if (member.role !== newRole) {
          member.role = newRole;
          hasChanges = true;
        }
      }
    }

    // 6. Save and Respond
    if (!hasChanges) {
      return res.status(200).json({ message: "No changes provided", team });
    }

    await team.save();
    res.status(200).json({ message: "Team details updated successfully", team });

  } catch (err) {
    // Handle database uniqueness error
    if (err.code === 11000) {
      return res.status(409).json({ message: "Team name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update team details", error: err.message });
  }
};