/**
 * Event Management Controller
 * Handles event creation, editing, publishing, deletion, and sub-event invitations.
 */

import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import InboxEntity from "../../models/inboxEntity.model.js";
import Team from "../../models/organizerteam.model.js";

/* ---------------------------------------------------------------
   🧩 Helper: Build Event Payload from Request Body
---------------------------------------------------------------- */
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
    createdBy,
  } = body;

  return {
    title,
    description,
    categoryTags,
    ruleBook,
    subEvents,
    gallery,
    createdBy,
    poc: { name: pocName, contact: pocPhone },
    venue,
  };
};

/* ---------------------------------------------------------------
   📩 Helper: Send Sub-Event Invitations
---------------------------------------------------------------- */
const sendSubeventInvites = async (event) => {
  try {
    if (!event?.createdBy) {
      console.warn(`⚠️ Event ${event.title} has no createdBy field.`);
      return;
    }

    const mainTeam = await Team.findById(event.createdBy).populate("leader");
    if (!mainTeam)
      return console.warn(`⚠️ Main team not found for event: ${event.title}`);
    if (!mainTeam.leader)
      return console.warn(
        `⚠️ Leader not found for main team: ${mainTeam.name}`
      );

    const leaderId = mainTeam.leader._id;

    for (const sub of event.subEvents || []) {
      if (!sub?.subevent) continue;

      const subEvent = await Event.findById(sub.subevent).populate("createdBy");
      if (!subEvent?.createdBy) {
        console.warn(
          `⚠️ Skipping subevent ${sub?.subevent}: missing createdBy`
        );
        continue;
      }

      const subTeam = await Team.findById(subEvent.createdBy).populate(
        "leader"
      );
      if (!subTeam) {
        console.warn(`⚠️ Subteam not found for subevent: ${subEvent.title}`);
        continue;
      }
      if (!subTeam.leader) {
        console.warn(`⚠️ Leader missing for subteam: ${subTeam.name}`);
        continue;
      }

      const subLeaderId = subTeam.leader._id;

      // Prevent duplicate invitations
      const existingInvite = await InboxEntity.findOne({
        type: "subevent_invite",
        relatedEvent: event._id,
        to: subLeaderId,
        relatedTeam: subTeam._id,
        status: "Pending",
      });

      if (existingInvite) {
        console.log(
          `⚠️ Invite already exists for ${subTeam.name}, skipping...`
        );
        continue;
      }

      await InboxEntity.create({
        type: "subevent_invite",
        title: `Invitation to join ${event.title}`,
        description: `You are invited by ${mainTeam.name} to participate as a sub-event under ${event.title}.`,
        from: leaderId,
        to: subLeaderId,
        status: "Pending",
        relatedEvent: event._id,
        relatedTeam: subTeam._id,
        relatedTeamModel: "OrganizerTeam", // ✅ match actual model name
      });

      console.log(`📩 Invite sent from ${mainTeam.name} → ${subTeam.name}`);
    }

    console.log("✅ Sub-event invitations sent successfully");
  } catch (err) {
    console.error("❌ Error sending subevent invites:", err);
  }
};

/* ---------------------------------------------------------------
   🎯 Controller: Save / Create Event
---------------------------------------------------------------- */
export const saveEvent = async (req, res) => {
  try {
    const eventPayload = getEventPayload(req.body);

    if (
      eventPayload.createdBy &&
      mongoose.isValidObjectId(eventPayload.createdBy)
    ) {
      eventPayload.createdBy = new mongoose.Types.ObjectId(
        eventPayload.createdBy
      );
    } else {
      console.warn("⚠️ Invalid or missing createdBy in event payload");
    }

    let event;
    let message;

    if (req.body._id) {
      event = await Event.findByIdAndUpdate(req.body._id, eventPayload, {
        new: true,
        runValidators: true,
      });
      if (!event)
        return res.status(404).json({ message: "Draft not found to update." });
      message = "Draft updated successfully";
    } else {
      eventPayload.status = "draft";
      event = await Event.create(eventPayload);
      message = "Event saved as draft successfully";
    }

    if (event?.subEvents?.length > 0) await sendSubeventInvites(event);

    res.status(200).json({ message, event });
  } catch (err) {
    console.error("❌ Error in saveEvent:", err);
    res
      .status(500)
      .json({ message: "Failed to save event as draft", error: err.message });
  }
};

/* ---------------------------------------------------------------
   🚀 Controller: Publish Event
---------------------------------------------------------------- */
export const publishEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    if (!eventId)
      return res.status(400).json({ message: "Event ID is required." });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const allApproved = event.subEvents.every(
      (sub) => sub.status === "Approved"
    );
    if (!allApproved)
      return res
        .status(400)
        .json({
          message: "All sub-events must be approved before publishing.",
        });

    event.status = "published";
    await event.save();

    res.status(200).json({ message: "Event published successfully", event });
  } catch (err) {
    console.error("❌ Error in publishEvent:", err);
    res
      .status(500)
      .json({ message: "Failed to publish event", error: err.message });
  }
};

/* ---------------------------------------------------------------
   ✏️ Controller: Edit Event + Send Invites for New Subevents
---------------------------------------------------------------- */
export const editEvent = async (req, res) => {
  try {
    const updateData = getEventPayload(req.body);
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent)
      return res.status(404).json({ message: "Event not found" });

    const oldIds = (existingEvent.subEvents || []).map((s) =>
      s.subevent?.toString()
    );
    const newIds = (updateData.subEvents || []).map((s) =>
      s.subevent?.toString()
    );
    const newlyAdded = newIds.filter((id) => id && !oldIds.includes(id));

    await Event.findByIdAndUpdate(req.params.id, updateData, {
      runValidators: true,
    });
    const updatedEvent = await Event.findById(req.params.id)
      .populate("createdBy")
      .lean();

    console.log(`✅ Event "${updatedEvent.title}" updated.`);
    console.log(`🟢 Newly added subevents: ${newlyAdded.join(", ") || "None"}`);

    if (newlyAdded.length > 0 && updatedEvent.createdBy) {
      const newSubList = updatedEvent.subEvents.filter((sub) =>
        newlyAdded.includes(sub.subevent?.toString())
      );

      if (newSubList.length > 0) {
        await sendSubeventInvites({ ...updatedEvent, subEvents: newSubList });
      } else {
        console.warn(
          `⚠️ No valid subevent objects found for IDs: ${newlyAdded}`
        );
      }
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    console.error("❌ Error in editEvent:", err);
    res
      .status(500)
      .json({ message: "Failed to update event", error: err.message });
  }
};

/* ---------------------------------------------------------------
   🧾 Controller: Get Event by ID
---------------------------------------------------------------- */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("createdBy", "name");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error("❌ Error in getEventById:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch event", error: err.message });
  }
};

/* ---------------------------------------------------------------
   🗑️ Controller: Delete Event
---------------------------------------------------------------- */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteEvent:", err);
    res
      .status(500)
      .json({ message: "Failed to delete event", error: err.message });
  }
};
