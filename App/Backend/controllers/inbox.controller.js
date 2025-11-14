import InboxEntity from "../models/inbox.model.js";


export const createDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type, title, description, to, message, relatedEvent, relatedTeam, relatedTeamModel } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: "Type and title are required" });
    }

    const draft = await InboxEntity.create({
      type,
      title,
      description,
      from: userId,
      to: to || [],
      message,
      relatedEvent,
      relatedTeam,
      relatedTeamModel,
      status: "Draft",
    });

    res.status(201).json({
      success: true,
      message: "Draft created successfully",
      data: draft,
    });
  } catch (error) {
    console.error("createDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to create draft" });
  }
};

// Edit Draft
export const editDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { draftId } = req.params;
    const { type, title, description, to, message, relatedEvent, relatedTeam, relatedTeamModel } = req.body;

    const draft = await InboxEntity.findById(draftId);

    if (!draft) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    if (draft.from.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized to edit this draft" });
    }

    if (draft.status !== "Draft") {
      return res.status(400).json({ success: false, error: "Can only edit drafts with Draft status" });
    }

    const updatedDraft = await InboxEntity.findByIdAndUpdate(
      draftId,
      {
        type: type || draft.type,
        title: title || draft.title,
        description: description || draft.description,
        to: to || draft.to,
        message: message || draft.message,
        relatedEvent: relatedEvent || draft.relatedEvent,
        relatedTeam: relatedTeam || draft.relatedTeam,
        relatedTeamModel: relatedTeamModel || draft.relatedTeamModel,
      },
      { new: true, runValidators: true }
    ).populate("from", "username email profile.name")
     .populate("to", "username email profile.name");

    res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      data: updatedDraft,
    });
  } catch (error) {
    console.error("editDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to update draft" });
  }
};

// Delete Draft
export const deleteDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { draftId } = req.params;

    const draft = await InboxEntity.findById(draftId);

    if (!draft) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    if (draft.from.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized to delete this draft" });
    }

    await InboxEntity.findByIdAndDelete(draftId);

    res.status(200).json({ 
      success: true,
      message: "Draft deleted successfully" 
    });
  } catch (error) {
    console.error("deleteDraft error:", error);
    res.status(500).json({ success: false, error: "Failed to delete draft" });
  }
};

// Get List of Drafts
export const getListOfDrafts = async (req, res) => {
  try {
    const userId = req.user?.id;

    const drafts = await InboxEntity.find({ from: userId, status: "Draft" })
      .populate("from", "username email profile.name")
      .populate("to", "username email profile.name")
      .populate("relatedEvent", "name description")
      .populate({
        path: "relatedTeam",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts,
    });
  } catch (error) {
    console.error("getListOfDrafts error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch drafts" });
  }
};

// Send Message (Change status from Draft to Sent)
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { draftId } = req.params;

    const draft = await InboxEntity.findById(draftId);

    if (!draft) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    if (draft.from.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized to send this message" });
    }

    if (!draft.to || draft.to.length === 0) {
      return res.status(400).json({ success: false, error: "Recipients are required to send message" });
    }

    const sentMessage = await InboxEntity.findByIdAndUpdate(
      draftId,
      { status: "Sent" },
      { new: true }
    )
      .populate("from", "username email profile.name")
      .populate("to", "username email profile.name")
      .populate("relatedEvent", "name description")
      .populate({
        path: "relatedTeam",
        select: "name",
      });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: sentMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

// Get List of Sent Messages
export const getListOfSents = async (req, res) => {
  try {
    const userId = req.user?.id;

    const sentMessages = await InboxEntity.find({
      from: userId,
      status: { $in: ["Sent", "Approved", "Rejected", "Pending"] },
    })
      .populate("from", "username email profile.name")
      .populate("to", "username email profile.name")
      .populate("relatedEvent", "name description")
      .populate({
        path: "relatedTeam",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sentMessages.length,
      data: sentMessages,
    });
  } catch (error) {
    console.error("getListOfSents error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sent messages" });
  }
};


// Get List of Arrivals (Messages received)
export const getListOfArrivals = async (req, res) => {
  try {
    const userId = req.user?.id;

    const arrivalMessages = await InboxEntity.find({ to: userId })
      .populate("from", "username email profile.name")
      .populate("to", "username email profile.name")
      .populate("relatedEvent", "name description")
      .populate({
        path: "relatedTeam",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: arrivalMessages.length,
      data: arrivalMessages,
    });
  } catch (error) {
    console.error("getListOfArrivals error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch arrival messages" });
  }
};