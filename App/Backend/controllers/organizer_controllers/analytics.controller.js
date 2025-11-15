import Event from "../../models/event.model.js";
import organizerTeam from "../../models/organizerTeam.model.js";
import Registration from "../../models/registration.model.js";

// Helper to get team IDs for the current user
async function getUserTeamIds(userId) {
    const teams = await organizerTeam.find({
      $or: [{ leader: userId }, { "members.user": userId, "members.status": "Approved" }],
    }).select("_id").lean();
    return teams.map((t) => t._id);
}

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const teamIds = await getUserTeamIds(userId);

        const events = await Event.find({ createdBy: { $in: teamIds } })
            .select('status ratings registrations')
            .lean();

        const totalEvents = events.length;
        const totalRegistrations = await Registration.countDocuments({ eventId: { $in: events.map(e => e._id) } });

        let totalRatings = 0;
        let ratedEventsCount = 0;
        events.forEach(event => {
            if (event.ratings && event.ratings.length > 0) {
                const eventTotalRating = event.ratings.reduce((acc, r) => acc + r.rating, 0);
                totalRatings += eventTotalRating / event.ratings.length;
                ratedEventsCount++;
            }
        });

        const avgRating = ratedEventsCount > 0 ? (totalRatings / ratedEventsCount).toFixed(1) : 0;

        // Placeholder for attendance until check-in is fully implemented
        const avgAttendance = 89; // Mock data for now

        res.status(200).json({
            totalEvents,
            totalRegistrations,
            avgAttendance,
            avgRating,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

export const getEventWiseRatings = async (req, res) => {
    try {
        const userId = req.user.id;
        const teamIds = await getUserTeamIds(userId);

        const events = await Event.find({ createdBy: { $in: teamIds }, 'ratings.0': { $exists: true } })
            .select('title ratings')
            .lean();

        const ratingsData = events.map(event => {
            const avgRating = event.ratings.reduce((acc, r) => acc + r.rating, 0) / event.ratings.length;
            return {
                name: event.title,
                rating: parseFloat(avgRating.toFixed(1)),
            };
        });

        res.status(200).json(ratingsData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch event-wise ratings", error: error.message });
    }
};

export const getAttendanceRatio = async (req, res) => {
    // This is a complex query and is mocked for now.
    // A real implementation would require aggregation pipelines on registration and check-in data.
    const attendanceRatioData = [
        { month: 'Jan', registered: 450, attended: 398 },
        { month: 'Feb', registered: 380, attended: 345 },
        { month: 'Mar', registered: 520, attended: 490 },
        { month: 'Apr', registered: 600, attended: 565 },
        { month: 'May', registered: 480, attended: 430 },
        { month: 'Jun', registered: 550, attended: 520 },
    ];
    res.status(200).json(attendanceRatioData);
};

export const getEventPerformance = async (req, res) => {
    // This is a complex query and is mocked for now.
    // A real implementation would require aggregation pipelines on ratings data.
    const eventPerformanceData = [
        { name: 'Excellent', value: 45, color: '#2D3E7E' },
        { name: 'Good', value: 35, color: '#FDB913' },
        { name: 'Average', value: 15, color: '#FF9F1C' },
        { name: 'Poor', value: 5, color: '#F24333' },
    ];
    res.status(200).json(eventPerformanceData);
};