import studentTeam from "../models/studentTeam.model.js";

export const createStudentTeam = async (req, res) => {
    try {
        const { teamName} = req.body;
        const leader = req.user.id;    
        
        const existingTeam = await studentTeam.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: "Team name already exists" });
        }

        const newTeam = new studentTeam({ teamName, leader });
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

        const team = await studentTeam.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the team leader can delete the team" });
        }

        await studentTeam.findByIdAndDelete(teamId);

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
    
        const leaderTeamsQuery = studentTeam.find({ leader: userId })
            .populate('leader', 'name email')
            .populate('members.member', 'name email');

        const memberTeamsQuery = studentTeam.find({ 'members.member': userId })
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


