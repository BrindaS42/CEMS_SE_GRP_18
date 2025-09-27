import Event from "../../models/event.model.js";

const getEventPayload = (body) => {
  const {
    title,
    description,
    categoryTags,
    ruleBook,
    poc,
    venue,
    subEvents,
    gallery,
  } = body;

  return {
    title,
    description,
    categoryTags,
    ruleBook,
    poc,
    venue,
    subEvents,
    gallery,
  };
};

export const saveEvent = async (req, res) => {
  try {
    const newEventData = getEventPayload(req.body);
    newEventData.status = "draft"; 
    const event = await Event.create(newEventData);

    res.status(201).json({ message: "Event saved as draft successfully", event });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to save event as draft", error: err.message });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "published";
    await event.save();

    res.status(200).json({ message: "Event published successfully", event });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to publish event", error: err.message });
  }
};

export const editEvent = async (req, res) => {
  try {
    const updateData = getEventPayload(req.body);

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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