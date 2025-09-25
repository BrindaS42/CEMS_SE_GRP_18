import express from "express";
import { saveEventLocation, getEventLocation } from "../controllers/event_controllers/map_annotator.controller.js"

const router = express.Router();

// Save or update location for an event
router.post("/:eventId/location", saveEventLocation);
// Get location for an event
router.get("/:eventId/location", getEventLocation);

export default router;

