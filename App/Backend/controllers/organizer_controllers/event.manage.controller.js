import Event from "../../models/event.model.js";

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
    createdBy  
  } = body;

  const newEventData = {
    title,
    description,
    categoryTags,
    ruleBook,
    subEvents,
    gallery,
    createdBy,
    poc: {
      name: pocName,
      contact: pocPhone, 
    },
    venue,
  };

  return newEventData;
};

export const saveEvent = async (req, res) => {
  try {
    const eventPayload = getEventPayload(req.body);
    let event;
    let message;

    if (req.body._id) {
      event = await Event.findByIdAndUpdate(req.body._id, eventPayload, { new: true, runValidators: true });
      if (!event) {
        return res.status(404).json({ message: "Draft not found to update." });
      }
      message = "Draft updated successfully";
    } else {
      eventPayload.status = "draft";
      event = await Event.create(eventPayload);
      message = "Event saved as draft successfully";
    }

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
    eventPayload.status = "published";
    let event;
    let message;

    if (req.body._id) {
      event = await Event.findByIdAndUpdate(req.body._id, eventPayload, { new: true, runValidators: true });
      if (!event) {
        return res.status(404).json({ message: "Event not found to publish." });
      }
      message = "Event published successfully";
    } else {
      event = await Event.create(eventPayload);
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
    const event = await Event.findById(id).populate('createdBy', 'name');
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