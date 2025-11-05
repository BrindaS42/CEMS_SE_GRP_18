// App/Backend/controllers/registration_controllers/registrationConfigController.js
import Event from "../../models/event.model.js";

// Controller to get registration configuration (questions, rules, etc.)
export const getRegistrationConfig = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).select("config title");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      eventTitle: event.title,
      registrationConfig: event.config || {},
    });
  } catch (error) {
    console.error("Error fetching registration config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration configuration",
      error: error.message,
    });
  }
};
