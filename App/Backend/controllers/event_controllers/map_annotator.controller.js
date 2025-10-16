import Event from "../../models/event.model.js";

export const saveEventLocation = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { location } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: "Missing eventId" });
    }
    if (!location || typeof location !== 'object') {
      return res.status(400).json({ message: "Invalid location payload" });
    }
    const mapAnnotations = Array.isArray(location.mapAnnotations) ? location.mapAnnotations.map((a) => ({
      label: a.label || "",
      description: a.description || "",
      coordinates: {
        lat: a.coordinates?.lat,
        lng: a.coordinates?.lng,
      },
      icon: a.icon,
      color: a.color,
    })) : [];

    const update = {
      location: {
        address: location.address || "",
        coordinates: {
          lat: location.coordinates?.lat,
          lng: location.coordinates?.lng,
        },
        mapAnnotations,
      },
      updatedAt: new Date(),
    };
    const event = await Event.findByIdAndUpdate(eventId, update, { new: true });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json({ message: "Location saved", event });
  } catch (err) {
    console.error("saveEventLocation error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEventLocation = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ message: "Missing eventId" });
    }

    const event = await Event.findById(eventId).select("location");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ location: event.location || null });
  } catch (err) {
    console.error("getEventLocation error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

