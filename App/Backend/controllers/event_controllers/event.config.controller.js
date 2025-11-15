import Event from "../../models/event.model.js";

export const createOrUpdateEventConfig = async (req, res) => {
  try {
    const { eventId, config } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    if (!config || typeof config !== "object") {
      return res.status(400).json({ error: "Valid config object is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existingConfig =
      event.config && typeof event.config.toObject === "function"
        ? event.config.toObject()
        : {};

    event.config = {
      ...existingConfig,
      ...config,
    };

    const updatedEvent = await event.save();

    return res.status(200).json({
      message: "Event configuration updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event config:", error);
    return res.status(500).json({
      error: "Failed to update event configuration",
      details: error.message,
    });
  }
};

export const getEventConfig = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).select("config");
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event.config || {},
      message: event.config
        ? "Config fetched successfully"
        : "No config set yet",
    });
  } catch (error) {
    console.error("Error fetching event config:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
