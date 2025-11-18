import Event from '../models/event.model.js';
import College from '../models/college.model.js';
import User from '../models/user.model.js';
import Team from '../models/organizerTeam.model.js'
import { model ,ObjectId} from 'mongoose';
import SponsorAd from '../models/sponsorad.model.js';

const createSuspensionNotification = async (fromAdminId, toUserId, entityName, modelType, action) => {
    try {
        const InboxEntity = model('InboxEntity'); 
        const title = action === 'suspended' ? `URGENT: ${entityName} Halted` : `${entityName} is Active Again`;
        const message = `Your associated entity (${entityName}, type: ${modelType}) has been forcibly ${action} by a System Administrator. Please contact the Admin for details.`;

        const newInboxEntity = new InboxEntity({
            type: 'announcement', 
            title: title,
            description: message,
            from: fromAdminId, 
            to: [toUserId],    
            status: 'Sent',
            message: message,
        });
        await newInboxEntity.save();
    } catch (error) {
        console.error("Failed to create suspension notification:", error.message);
    }
};

export const handleCollegeRegistration = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const { status } = req.body;
        const adminId = req.user.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status provided. Must be 'Approved' or 'Rejected'." });
        }

        const updatedCollege = await College.findOneAndUpdate(
            {
                _id: collegeId,
                status: 'Pending'
            },
            { 
                status: status,
                approvedBy: adminId
            },
            { new: true, runValidators: true }
        ).select('-__v'); 
        if (!updatedCollege) {
            const college = await College.findById(collegeId);
            if (college && college.status !== 'Pending') {
                return res.status(409).json({ 
                    message: `Conflict: College registration is already ${college.status}. Cannot be updated from Pending.` 
                });
            }
            return res.status(404).json({ message: "College registration not found." });
        }
        
        res.status(200).json({
            message: `College registration for ${updatedCollege.name} successfully ${status}.`,
            college: updatedCollege
        });

    } catch (error) {
        console.error("Error handling college registration:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid College ID format." });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const getAllEventsForAdmin = async (req, res) => {
    try {
        const events = await Event.find({}).populate('college', 'name').populate('createdBy', 'name').sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching all events for admin:", error);
        res.status(500).json({ message: 'Server error while fetching events.' });
    }
};

export const getAllUsersForAdmin = async (req, res) => {
    try {
        // Fetch all users except the admin making the request
        const users = await User.find({ _id: { $ne: req.user.id } }).populate('college', 'name').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users for admin:", error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};

export const getAllAdsForAdmin = async (req, res) => {
    try {
        const ads = await SponsorAd.find({})
            .populate({
                path: 'sponsorId',
                select: 'profile.name _id',
                // The transform function must handle cases where the sponsor document might be null (e.g., deleted user)
                transform: (doc) => {
                    if (!doc) return { _id: null, profile: { name: 'Deleted Sponsor' } };
                    return doc;
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(ads);
    } catch (error) {
        console.error("Error fetching all ads for admin:", error);
        res.status(500).json({ message: 'Server error while fetching ads.' });
    }
};


// In controllers/admin.controller.js (The suspendCollegeAndEntities function)

export const suspendCollegeAndEntities = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const adminId = req.user.id;

        // 1. Suspension of College (Only runs if status is 'Approved')
        const suspendedCollege = await College.findOneAndUpdate(
            {
                _id: collegeId,
                status: 'Approved' 
            },
            {
                $set: { 
                    status: 'Suspended',
                    approvedBy: adminId 
                }
            },
            { new: true }
        );

        if (!suspendedCollege) {
            // Check the current status of the college to give a specific error message
            const collegeCheck = await College.findById(collegeId).select('status');
            
            if (collegeCheck) {
                if (collegeCheck.status === 'Suspended') {
                    // NEW CHECK: Conflict if status is already Suspended
                    return res.status(409).json({
                        message: `Conflict: College registration is already Suspended. No action taken.`
                    });
                }
                if (collegeCheck.status !== 'Approved') {
                    // Conflict if status is Rejected or Pending (the original check)
                    return res.status(409).json({ 
                        message: `Conflict: College status is currently "${collegeCheck.status}". Only Approved colleges can be suspended.` 
                    });
                }
            }
            
            // If ID is valid but no document found (deleted, or ID is wrong)
            return res.status(404).json({ message: "College registration not found." });
        }
        
        // --- 2. Suspension of Related Entities (UpdateMany) ---
        
        const userResult = await User.updateMany(
            { college: collegeId, status: { $ne: 'suspended' } }, // Optional: Only update if not already suspended
            { $set: { status: 'suspended' } } 
        );

        const eventResult = await Event.updateMany(
            { college: collegeId, status: { $ne: 'suspended' } }, // Optional: Only update if not already suspended
            { $set: { status: 'suspended' } } 
        );

        // 3. Success Response
        res.status(200).json({
            message: `College '${suspendedCollege.name}' successfully suspended, and related entities halted.`,
            summary: {
                collegeId: collegeId,
                usersSuspended: userResult.modifiedCount,
                eventsSuspended: eventResult.modifiedCount 
            }
        });

    } catch (error) {
        console.error("Error suspending college and entities:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid College ID format." });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const unsuspendCollegeAndEntities = async (req, res) => {
    try {
        const { collegeId } = req.params;
        const adminId = req.user.id;

        // 1. Un-suspension of College (Only runs if status is 'Suspended')
        const unsuspendedCollege = await College.findOneAndUpdate(
            {
                _id: collegeId,
                status: 'Suspended' 
            },
            {
                $set: { 
                    status: 'Approved', // Revert to Approved status
                    approvedBy: adminId 
                }
            },
            { new: true }
        );

        if (!unsuspendedCollege) {
            const collegeCheck = await College.findById(collegeId).select('status');
            if (collegeCheck) {
                if (collegeCheck.status !== 'Suspended') {
                    return res.status(409).json({
                        message: `Conflict: College status is currently "${collegeCheck.status}". Only Suspended colleges can be unsuspended.`
                    });
                }
            }
            return res.status(404).json({ message: "Suspended college registration not found." });
        }
        
        // --- 2. Un-suspension of Related Entities ---
        const userResult = await User.updateMany(
            { college: collegeId, status: 'suspended' },
            { $set: { status: 'active' } } 
        );

        // Note: You might have different 'active' states for events (e.g., 'Published'). Adjust if needed.
        const eventResult = await Event.updateMany(
            { college: collegeId, status: 'suspended' },
            { $set: { status: 'published' } } 
        );

        res.status(200).json({
            message: `College '${unsuspendedCollege.name}' successfully unsuspended, and related entities reactivated.`,
            summary: { collegeId, usersUnsuspended: userResult.modifiedCount, eventsUnsuspended: eventResult.modifiedCount }
        });

    } catch (error) {
        console.error("Error unsuspending college and entities:", error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const toggleSuspension = async (req, res) => {
    try {
        const { modelType, id } = req.params;
        const { targetStatus } = req.body; 
        const adminId = req.user.id;

        const SponsorAd = model('SponsorAd'); 
        const InboxEntity = model('InboxEntity'); 

        const validModels = {
            'user': { Model: model('User'), activeStatus: 'active', suspendedStatus: 'suspended' },
            'event': { Model: model('Event'), activeStatus: 'published', suspendedStatus: 'suspended' },
            'ad': { Model: SponsorAd, activeStatus: 'Published', suspendedStatus: 'Suspended' }
        };

        const config = validModels[modelType];
        if (!config || !['suspended', 'active'].includes(targetStatus)) {
            return res.status(400).json({ message: "Invalid model type or targetStatus specified." });
        }
        
        let finalStatus = targetStatus === 'suspended' ? config.suspendedStatus : config.activeStatus;
        
        const updatedDoc = await config.Model.findByIdAndUpdate(
            id,
            { status: finalStatus },
            { new: true, runValidators: true }
        )
        .select('_id status name title createdBy sponsorId'); 

        if (!updatedDoc) {
            return res.status(404).json({ message: `${modelType} with ID ${id} not found.` });
        }
        
        let recipientId = null;
        let entityName = updatedDoc.title || updatedDoc.name || updatedDoc._id.toString(); 
        const action = targetStatus;

        if (modelType === 'user') {
            recipientId = updatedDoc._id; 
        } else if (modelType === 'ad') {
            recipientId = updatedDoc.sponsorId;
        } else if (modelType === 'event') {
            const team = await Team.findById(updatedDoc.createdBy).select('leader');
            if (team && team.leader) {
                 recipientId = team.leader;
            }
        }
        
        if (recipientId) {
            const title = action === 'suspended' ? `URGENT: ${entityName} Halted` : `${entityName} is Active Again`;
            const message = `Your associated entity (${entityName}, type: ${modelType}) has been forcibly ${action} by a System Administrator. Please contact the Admin for details.`;

            const newInboxEntity = new InboxEntity({
                type: 'announcement', 
                title: title,
                description: message,
                from: adminId, 
                to: [recipientId],
                status: 'Sent',
                message: message,
            });
            await newInboxEntity.save();
        }

        res.status(200).json({
            message: `${modelType} status successfully updated to ${finalStatus}. Notification queued.`,
            document: updatedDoc
        });

    } catch (error) {
        console.error("Error toggling suspension:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

export const createReport = async (req, res) => {
    try {
        const { modelType, id } = req.params;
        const { reason } = req.body; 
        const reporterId = req.user.id; 

        if (!reason) {
            return res.status(400).json({ message: "A reason for the report is required." });
        }

        // 1. DYNAMICALLY FIND ALL ADMIN USERS
        const adminUsers = await User.find({ role: 'admin' }).select('_id');
        const adminIds = adminUsers.map(user => user._id); 

        // 2. Model Configuration & Recipient Resolution
        const reportConfig = {
            'event': { Model: model('Event'), eventType: 'report_event', ownerType: 'Team Leader' },
            'ad': { Model: model('SponsorAd'), eventType: 'report_ad', ownerField: 'sponsorId', ownerType: 'Sponsor' },
            'user': { Model: model('User'), eventType: 'report_user', ownerField: '_id', ownerType: 'User' }
        };

        const config = reportConfig[modelType];
        if (!config) {
            return res.status(400).json({ message: "Invalid model type for reporting." });
        }

        // 3. Find the reported entity and the owner
        const reportedEntity = await config.Model.findById(id);
        
        if (!reportedEntity) {
            return res.status(404).json({ message: `The reported ${modelType} was not found.` });
        }

        let ownerId = null;
        let entityName = reportedEntity.title || reportedEntity.name || modelType;

        if (modelType === 'event') {
            const team = await Team.findById(reportedEntity.createdBy).select('leader');
            ownerId = team ? team.leader : null;
        } else if (modelType === 'ad') {
            ownerId = reportedEntity.sponsorId;
        } else {
            ownerId = reportedEntity._id;
        }
        
        // 4. Assemble Recipients Array
        const recipients = [...adminIds]; // Start with ALL Admin IDs
        if (ownerId && !recipients.some(id => id.equals(ownerId))) { 
             recipients.push(ownerId); // Notify the responsible party
        }
        
        // 5. Create the Inbox Entity (Report)
        const InboxEntity = model('InboxEntity');

        const newReport = new InboxEntity({
            type: 'message',
            title: `Report Filed: ${modelType.toUpperCase()} - ${entityName}`,
            description: `Reason: ${reason}`,
            from: reporterId, // 🛑 FIX APPLIED: FROM the user who submitted the report
            to: recipients, // Array of ALL Admin IDs + Owner ID
            status: 'Pending', // Status is Pending for review
            relatedEvent: modelType === 'event' ? reportedEntity._id : undefined,
            // ... (other related fields can be added here) ...
        });
        console.log("New Report:", newReport);
        await newReport.save();

        res.status(201).json({
            message: `Report filed successfully. Admin and ${config.ownerType} have been notified.`,
            reportId: newReport._id
        });

    } catch (error) {
        console.error("Error filing report:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format provided." });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};