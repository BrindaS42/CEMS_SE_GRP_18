import express from "express";
import {
  saveEvent,
  publishEvent,
  editEvent,
  deleteEvent,
  getEventById
} from "../controllers/event_controllers/event.manage.controller.js";
import { saveEventLocation, getEventLocation } from "../controllers/event_controllers/map_annotator.controller.js"

const router = express.Router();


router.post("/:eventId/location", saveEventLocation);
router.get("/:eventId/location", getEventLocation);

router.post("/save", saveEvent);
router.post("/publish", publishEvent);
router.put("/edit/:id", editEvent);
router.delete("/delete/:id", deleteEvent);
router.get("/:id", getEventById); 
export default router;
