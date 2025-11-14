import mongoose from "mongoose";
import InboxEntity from "../models/message.model.js";
import Event from "../models/event.model.js";
import Team from "../models/organizerteam.model.js";
import StudentTeam from "../models/studentTeam.model.js";
import Registration from "../models/registration.model.js";

export const approveInboxEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const inbox = await InboxEntity.findById(id)
      .populate("relatedEvent", "_id title subEvents sponsors")
      .lean();

    if (!inbox) {
      return res.status(404).json({ message: "Inbox item not found" });
    }

    if (
      inbox.type === "message" ||
      inbox.type === "announcement" ||
      inbox.type === "sponsorship_req"
    ) {
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });
      return res.status(200).json({
        success: true,
        message: `${inbox.type} approved successfully`,
      });
    }

    if (inbox.type === "subevent_invite") {
      const toUserId = inbox.to;
      const team = await Team.findOne({ leader: toUserId });
      if (!team) {
        return res
          .status(404)
          .json({ message: "No team found where recipient is leader" });
      }

      const subevent = await Event.findOne({ createdBy: team._id });
      const mainEvent = await Event.findById(inbox.relatedEvent);
      if (!mainEvent || !subevent) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!Array.isArray(mainEvent.subEvents)) mainEvent.subEvents = [];
      let index = mainEvent.subEvents.findIndex(
        (s) => s.subevent?.toString() === subevent._id.toString()
      );

      if (index === -1) {
        mainEvent.subEvents.push({
          subevent: subevent._id,
          status: "Approved",
        });
        index = mainEvent.subEvents.length - 1;
      } else {
        mainEvent.subEvents[index].status = "Approved";
      }

      await mainEvent.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Subevent invitation approved successfully",
        data: {
          mainEventId: mainEvent._id,
          subeventId: subevent._id,
          teamName: team.name,
          updatedSubevent: mainEvent.subEvents[index],
        },
      });
    }

    if (inbox.type === "mou_req") {
      const sponsorId = inbox.to;
      const eventId = inbox.relatedEvent;

      const event = await Event.findById(eventId);
      if (!event) {
        return res
          .status(404)
          .json({ message: "Event not found for MoU request" });
      }

      if (!Array.isArray(event.sponsors)) event.sponsors = [];
      const exists = event.sponsors.some(
        (s) => s.toString() === sponsorId.toString()
      );
      if (!exists) event.sponsors.push(sponsorId);

      await event.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "MoU request approved successfully",
        data: {
          eventId: event._id,
          eventTitle: event.title,
          sponsorId,
          sponsorsList: event.sponsors,
        },
      });
    }

    if (inbox.type === "team_invite") {
      const teamId = inbox.relatedTeam;
      const newMemberId = inbox.from;

      const studentTeam = await StudentTeam.findById(teamId);
      if (!studentTeam)
        return res.status(404).json({ message: "Team not found" });

      const exists = studentTeam.members.some(
        (m) => m.member.toString() === newMemberId.toString()
      );

      if (exists) {
        const idx = studentTeam.members.findIndex(
          (m) => m.member.toString() === newMemberId.toString()
        );
        studentTeam.members[idx].status = "Approved";
      } else {
        studentTeam.members.push({ member: newMemberId, status: "Approved" });
      }

      await studentTeam.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Student added to team successfully",
        data: {
          teamId: studentTeam._id,
          teamName: studentTeam.teamName,
          members: studentTeam.members,
        },
      });
    }

    if (inbox.type === "organizer_team_invite") {
      const teamId = inbox.relatedTeam;
      const newMemberId = inbox.from;
      const roleFromMessage = inbox.role || "volunteer";

      const organizerTeam = await Team.findById(teamId);
      if (!organizerTeam)
        return res.status(404).json({ message: "Organizer team not found" });

      const exists = organizerTeam.members?.some(
        (m) => m.user.toString() === newMemberId.toString()
      );

      if (exists) {
        const idx = organizerTeam.members.findIndex(
          (m) => m.user.toString() === newMemberId.toString()
        );
        organizerTeam.members[idx].role = roleFromMessage;
        organizerTeam.members[idx].status = "Approved";
      } else {
        organizerTeam.members.push({
          user: newMemberId,
          role: roleFromMessage,
          status: "Approved",
        });
      }

      await organizerTeam.save();
      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Organizer added to organizing team successfully",
        data: {
          teamId: organizerTeam._id,
          teamName: organizerTeam.name,
          members: organizerTeam.members,
        },
      });
    }

    if (inbox.type === "registration_approval") {
      const studentId = inbox.from?._id || inbox.from;
      const eventId = inbox.relatedEvent?._id || inbox.relatedEvent;

      const registration = await Registration.findOne({ studentId, eventId });
      if (!registration)
        return res.status(404).json({ message: "No registration found" });

      registration.paymentStatus = "Paid";
      registration.status = "Approved";
      await registration.save();

      await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });

      return res.status(200).json({
        success: true,
        message: "Registration approved successfully",
        data: registration,
      });
    }

    await InboxEntity.findByIdAndUpdate(id, { status: "Approved" });
    res.status(200).json({
      success: true,
      message: `${inbox.type} approved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve inbox",
      error: error.message,
    });
  }
};

export const rejectInboxEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const inbox = await InboxEntity.findById(id);

    if (!inbox) {
      return res.status(404).json({ message: "Inbox item not found" });
    }

    inbox.status = "Rejected";
    await inbox.save();

    return res.status(200).json({
      success: true,
      message: `${inbox.type} rejected successfully`,
      data: { id: inbox._id, type: inbox.type },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject inbox item",
      error: error.message,
    });
  }
};
