import Event from "../../models/event.model.js";
import OrganizerTeam from "../../models/organizerTeam.model.js";
import User from "../../models/user.model.js";
import InboxEntity from "../../models/inbox.model.js";
import { populateEventDetails } from "./organizer.dashboard.controller.js";

const getEventPayload = (body) => {
  const {
    title,
    description,
    categoryTags,
    ruleBook,
    pocName,
    pocPhone, 
    venue,  
    subEvents,
    gallery,
    timeline,
    createdBy,
    config,
    poc
  } = body;

  const newEventData = {
    title,
    description,
    categoryTags,
    ruleBook,
    subEvents,
    gallery,
    createdBy,
    poc: poc || { name: pocName, contact: pocPhone },
    venue,
    timeline,
    config
  };

  return newEventData;
};


async function sendSubEventInvites(mainEvent) {
  if (!mainEvent.subEvents || mainEvent.subEvents.length === 0) {
    return; // No sub-events to process
  }

  // Get the leader of the main event's team to set as the 'from' user in the invite
  const mainTeam = await OrganizerTeam.findById(mainEvent.createdBy).select('leader').lean();
  if (!mainTeam || !mainTeam.leader) {
    console.error(`Could not find leader for main event's team: ${mainEvent.createdBy}`);
    return;
  }
  const fromUserId = mainTeam.leader;

  for (const sub of mainEvent.subEvents) {
    try {
      console.log(`Processing sub-event invitation for ${sub.subevent}`);
      const subEventDocument = await Event.findById(sub.subevent)
        .populate({
          path: 'createdBy',
          select: 'leader',
        });

      if (!subEventDocument || !subEventDocument.createdBy || !subEventDocument.createdBy.leader) {
        console.error(`Could not find leader for sub-event: ${sub.subevent}`);
        continue; // Skip to the next sub-event
      }

      const subEventLeaderId = subEventDocument.createdBy.leader;      

      // Check if an invitation already exists to prevent duplicates
      const existingInvite = await InboxEntity.findOne({
        relatedEvent: mainEvent._id,
        'meta.subEventId': sub.subevent,
        to: subEventLeaderId,
        type: 'subevent_invite'
      });
      console.log('Existing invite check:', existingInvite);
      if (!existingInvite) {
        await InboxEntity.create({
          type: 'subevent_invite',
          title: `Request to be a sub-event for "${mainEvent.title}"`,
          description: `Your event "${subEventDocument.title}" has been requested to be a sub-event. Please approve or reject this request.`,
          from: fromUserId,
          to: [subEventLeaderId], 
          status: 'Pending',
          relatedEvent: mainEvent._id,
          meta: {
            subEventId: sub.subevent
          }
        });
      }
    } catch (err) {
      console.error(`Failed to process sub-event invitation for ${sub.subevent}:`, err);
    }
  }
}

export const saveEvent = async (req, res) => {
  try {
    const eventPayload = getEventPayload(req.body);

    // Fetch and inject the college from the team leader
    if (eventPayload.createdBy) {
      const team = await OrganizerTeam.findById(eventPayload.createdBy).populate('leader');
      if (team && team.leader && team.leader.college) {
        eventPayload.college = team.leader.college;
      } else {
        // If college is required and not found, we should fail fast.
        return res.status(400).json({ message: "Could not determine college from team leader. Event cannot be saved." });
      }
    }
    let event;
    let message;

    if (req.body._id) {
      event = await Event.findByIdAndUpdate(req.body._id, eventPayload, { new: true, runValidators: true }).populate(populateEventDetails);
      if (!event) {
        return res.status(404).json({ message: "Draft not found to update." });
      }
      message = "Draft updated successfully";
    } else {
      eventPayload.status = "draft";
      event = await Event.create(eventPayload);
      await event.populate(populateEventDetails);
      message = "Event saved as draft successfully";
    }

    // After saving, send out invitations for any new sub-events
    await sendSubEventInvites(event);

    res.status(200).json({ message, event });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to save event as draft", error: err.message });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const eventPayload = getEventPayload(req.body);

    // Fetch and inject the college from the team leader
    if (eventPayload.createdBy) {
      const team = await OrganizerTeam.findById(eventPayload.createdBy).populate('leader');
      if (team && team.leader && team.leader.college) {
        eventPayload.college = team.leader.college;
      } else {
        // If college is required and not found, we should fail fast.
        return res.status(400).json({ message: "Could not determine college from team leader. Event cannot be published." });
      }
    }

    eventPayload.status = "published";
    let event;
    let message;

    if (req.body._id) {
      event = await Event.findByIdAndUpdate(req.body._id, eventPayload, { new: true, runValidators: true }).populate(populateEventDetails);
      if (!event) {
        return res.status(404).json({ message: "Event not found to publish." });
      }
      message = "Event published successfully";
    } else {
      event = await Event.create(eventPayload);
      await event.populate(populateEventDetails);
      message = "Event created and published successfully";
    }
    res.status(200).json({ message, event });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to publish event", error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).select('+poc').populate(populateEventDetails);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
  }
};

export const editEvent = async (req, res) => {
  try {
    const updateData = getEventPayload(req.body);

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate(populateEventDetails);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update event", error: err.message });
  }
};

export const completeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id).populate('createdBy');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization check: Only the team leader can complete the event.
    if (event.createdBy.leader.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: Only the team leader can complete this event." });
    }

    event.status = 'completed';
    await event.save();

    // Repopulate to send back consistent data
    const updatedEvent = await Event.findById(id).select(eventFieldsToSelect).populate(populateEventDetails).populate({ path: 'announcements.author', select: 'profile.name email _id' });

    res.status(200).json({ message: "Event marked as completed.", event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete event", error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
};

export const getPotentialSubEvents = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await OrganizerTeam.findById(teamId).populate({
      path: 'leader',
      select: 'college' // Explicitly select the college field
    });

    if (!team || !team.leader || !team.leader.college) {
      console.log('Could not find college from team leader. Team:', team);
      return res.status(200).json([]); // Return empty if college cannot be determined
    }

    const potentialEvents = await Event.find({ college: team.leader.college, status: 'published' }).select('_id title description createdBy').populate('createdBy', 'name');
    res.status(200).json(potentialEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch potential sub-events", error: err.message });
  }
};