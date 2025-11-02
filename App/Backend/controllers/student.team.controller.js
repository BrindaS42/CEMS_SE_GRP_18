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