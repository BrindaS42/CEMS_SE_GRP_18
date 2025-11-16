import StudentTeam from "../../models/studentTeam.model.js";
import InboxEntity from "../../models/inbox.model.js";
import User from "../../models/user.model.js";
import Registration from "../../models/registration.model.js";

export const createStudentTeam = async (req, res) => {
  try {
    const { teamName, members } = req.body; // Expect members array with student IDs
    const leaderId = req.user.id;

    if (!teamName?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const existingTeam = await StudentTeam.findOne({
      teamName: { $regex: `^${teamName.trim()}$`, $options: "i" },
    });
    if (existingTeam) {
      return res.status(409).json({ message: "Team name already exists" });
    }

    const newTeam = new StudentTeam({ teamName: teamName.trim(), leader: leaderId, members: [] });

    // If members are provided, add them with "Pending" status and send invites
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        // Add member to team with "Pending" status
        newTeam.members.push({ member: memberId, status: "Pending" });

        // Create an invitation in the inbox for the new member
        await InboxEntity.create({
          type: "team_invite",
          title: `Invitation to join team: ${newTeam.teamName}`,
          description: `You have been invited by ${req.user.name} to join the team "${newTeam.teamName}".`,
          from: leaderId,
          to: memberId,
          status: "Pending",
          relatedTeam: newTeam._id,
          relatedTeamModel: "StudentTeam",
        });
      }
    }

    await newTeam.save();

    const populatedTeam = await StudentTeam.findById(newTeam._id)
      .populate('leader', 'profile.name email')
      .populate('members.member', 'profile.name email')
      .lean();

    res.status(201).json({ message: "Student team created and invites sent successfully", team: populatedTeam });
  } catch (error) {
    console.error("Error creating student team:", error);
    res.status(500).json({ message: "Failed to create student team", error: error.message });
  }
};

export const deleteStudentTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await StudentTeam.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the team leader can delete the team" });
        }

        await StudentTeam.findByIdAndDelete(teamId);

        res.status(200).json({ message: "Student team deleted successfully" });
    } catch (error) {
        console.error("Error deleting student team:", error);
        res.status(500).json({ message: "Failed to delete student team", error: error.message });
    }
};

export const getStudentTeams = async (req, res) => {
    try {
        const userId = req.user.id; 

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
    
        const leaderTeamsQuery = StudentTeam.find({ leader: userId });
        const memberTeamsQuery = StudentTeam.find({ 'members.member': userId });
    
        const [leaderTeams, memberTeams] = await Promise.all([
            leaderTeamsQuery.populate('leader', 'profile.name email').populate('members.member', 'profile.name email').lean(),
            memberTeamsQuery.populate('leader', 'profile.name email').populate('members.member', 'profile.name email').lean()
        ]);

        // Add registration status to leader teams
        const registrationChecks = leaderTeams.map(team => 
            Registration.findOne({ teamName: team._id }).select('_id eventId').populate('eventId', 'title').lean()
        );
        const registrations = await Promise.all(registrationChecks);

        const leaderTeamsWithStatus = leaderTeams.map((team, index) => {
            const registration = registrations[index];
            return {
                ...team,
                isRegisteredForEvent: !!registration,
                linkedEvent: registration ? {
                    name: registration.eventId?.title,
                    id: registration.eventId?._id
                } : null,
            };
        });
    
        res.status(200).json({
            "leader": leaderTeamsWithStatus,
            "member": memberTeams
        });

    } catch (error) {
        console.error("Error fetching student teams:", error);
        res.status(500).json({ message: "Failed to fetch student teams", error: error.message });
    }
};

export const sendInvitationToJoinTeam = async (req, res) => {
    try{
        const teamId = req.params.teamId;
        const requesterId = req.user.id;
        
        const team = await StudentTeam.findById(teamId);
        
        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }

        const leaderId = team.leader;
        if (leaderId.toString() === requesterId) {
            return res.status(409).json({ message: "You are already the leader of this team." });
        }

        const isAlreadyMember = team.members.some(
            (m) => m.member.toString() === requesterId
        );
        
        if (isAlreadyMember) {
            return res.status(409).json({ message: "You are already a member of this team." });
        }
        
        const existingRequest = await InboxEntity.findOne({
            type: "team_invite", 
            from: requesterId,
            to: leaderId,
            relatedTeam: teamId,
            status: "Sent",
        });
        
        if (existingRequest) {
            return res.status(409).json({ message: "You have already sent a request to join this team." });
        }
        const newRequest = new InboxEntity({
            type: "team_invite", 
            title: `Request to join ${team.teamName}`,
            description: `User ${req.user.name || ''} wants to join your team.`, 
            from: requesterId, 
            to: leaderId, 
            status: "Sent", 
            relatedTeam: teamId,
            relatedTeamModel: "StudentTeam",
        });

        await newRequest.save();

        team.members.push({ member: requesterId, status: "Pending" });
        await team.save();
        
        res.status(201).json({ 
            message: "Request to join sent successfully.",
            request: newRequest 
        });
        
    } catch (error) {
        console.error("Error requesting to join team:", error);
        res.status(500).json({ message: "Failed to send join request", error: error.message });
    }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('profile.name email college').lean();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};


export const showAllStudentTeam = async (req, res) => {
    try {
        const teams = await StudentTeam.find().populate('leader', 'profile.name email').populate('members.member', 'profile.name email');
        res.status(200).json({ teams });
    } catch (error) {
        console.error("Error fetching student teams:", error);
        res.status(500).json({ message: "Failed to fetch student teams", error: error.message });
    }
};

export const updateStudentTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { teamName, membersToRemove, membersToUpdateStatus, membersToAdd } = req.body;
    const leaderId = req.user.id; 

    const team = await StudentTeam.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can edit the team" });
    }

    let hasChanges = false;
    const validStatuses = ["Approved", "Pending", "Rejected"];

    if (teamName !== undefined) {
      const trimmedName = teamName.trim();
      if (trimmedName === "") {
        return res.status(400).json({ message: "Team name, if provided, cannot be empty" });
      }

      if (team.teamName !== trimmedName) {
        
        const existing = await StudentTeam.findOne({ teamName: trimmedName });

        if (existing) {
          return res.status(409).json({ message: "That exact team name is already taken" });
        }
        team.teamName = trimmedName;
        hasChanges = true;
      }
    }

    if (membersToRemove && Array.isArray(membersToRemove)) {
      if (membersToRemove.includes(leaderId.toString())) {
        return res.status(400).json({ message: "The team leader cannot be removed" });
      }
      const originalCount = team.members.length;
      // Filter out members whose 'member' ID is in the membersToRemove array.
      team.members = team.members.filter(m => !membersToRemove.includes(m.member.toString()));

      if (team.members.length < originalCount) {
        hasChanges = true;
      }
    }

    if (membersToUpdateStatus && Array.isArray(membersToUpdateStatus)) {
      for (const update of membersToUpdateStatus) {
        const { memberId, newStatus } = update;

        if (!memberId || !newStatus || !validStatuses.includes(newStatus)) {
          return res.status(400).json({ message: "Invalid payload for membersToUpdateStatus" });
        }
        if (memberId === leaderId.toString()) {
           return res.status(400).json({ message: "Cannot change the leader's status" });
        }

        const memberToUpdate = team.members.find(m => m.member.toString() === memberId);
        if (!memberToUpdate) {
          return res.status(404).json({ message: `Member with ID ${memberId} not found in this team` });
        }

        if (memberToUpdate.status !== newStatus) {
          memberToUpdate.status = newStatus;
          hasChanges = true;
        }
      }
    }

    if (membersToAdd && Array.isArray(membersToAdd)) {
      for (const memberId of membersToAdd) {
        const isAlreadyMember = team.members.some(m => m.member.toString() === memberId);
        if (!isAlreadyMember) {
          // Check if an invitation is already pending for this user to avoid duplicates
          const existingInvitation = await InboxEntity.findOne({
            relatedTeam: team._id,
            to: memberId,
            status: "Pending",
            type: "team_invite"
          });

          if (existingInvitation) {
            continue; // Skip this user, an invite is already out.
          }
          // Add member to team with "Pending" status and send an invite.
          team.members.push({ member: memberId, status: "Pending" });

          // Create an invitation in the inbox for the new member.
          await InboxEntity.create({
            type: "team_invite",
            title: `Invitation to join team: ${team.teamName}`,
            description: `You have been invited by ${req.user.name} to join the team "${team.teamName}".`,
            from: leaderId,
            to: memberId,
            status: "Pending",
            relatedTeam: team._id,
            relatedTeamModel: "StudentTeam",
          });

          hasChanges = true;
        }
      }
    }

    if (!hasChanges) {
      return res.status(200).json({ message: "No changes provided", team });
    }

    await team.save();

    // Re-populate the team before sending it back to the client
    const populatedTeam = await StudentTeam.findById(team._id)
      .populate('leader', 'profile.name email')
      .populate('members.member', 'profile.name email')
      .lean();

    res.status(200).json({ message: "Team details updated successfully", team: populatedTeam });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Team name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update team details", error: err.message });
  }
};