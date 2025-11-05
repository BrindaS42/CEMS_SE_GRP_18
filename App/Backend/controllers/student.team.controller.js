import StudentTeam from "../models/studentTeam.model.js";
import InboxEntity from "../models/message.model.js";

export const createStudentTeam = async (req, res) => {
    try {
        const { teamName} = req.body;
        const leader = req.user.id;    
        
        const existingTeam = await StudentTeam.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: "Team name already exists" });
        }

        const newTeam = new StudentTeam({ teamName, leader });
        await newTeam.save();

        res.status(201).json({ message: "Student team created successfully", team: newTeam });
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
    
        const leaderTeamsQuery = StudentTeam.find({ leader: userId })
            .populate('leader', 'name email')
            .populate('members.member', 'name email');

        const memberTeamsQuery = StudentTeam.find({ 'members.member': userId })
            .populate('leader', 'name email')
            .populate('members.member', 'name email');
    
        const [leaderTeams, memberTeams] = await Promise.all([
            leaderTeamsQuery,
            memberTeamsQuery
        ]);
    
        res.status(200).json({
            "leader": leaderTeams,
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


export const showAllStudentTeam = async (req, res) => {
    try {
        const teams = await StudentTeam.find().populate('leader', 'username email').populate('members.member', 'username email');
        res.status(200).json({ teams });
    } catch (error) {
        console.error("Error fetching student teams:", error);
        res.status(500).json({ message: "Failed to fetch student teams", error: error.message });
    }
};

export const updateStudentTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { teamName, membersToRemove, membersToUpdateStatus } = req.body;
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

    if (!hasChanges) {
      return res.status(200).json({ message: "No changes provided", team });
    }

    await team.save();
    res.status(200).json({ message: "Team details updated successfully", team });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Team name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update team details", error: err.message });
  }
};