import express from "express";
import {
  saveEvent,
  publishEvent,
  editEvent,
  deleteEvent,
  getEventById
} from "../controllers/event_controllers/event.manage.controller.js";

const router = express.Router();

router.post("/save", saveEvent);
router.post("/publish", publishEvent);
router.put("/edit/:id", editEvent);
router.delete("/delete/:id", deleteEvent);
router.get("/:id", getEventById); 
export default router;
