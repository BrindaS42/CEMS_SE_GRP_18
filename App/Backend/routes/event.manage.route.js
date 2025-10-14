import express from "express";
import {
  saveEvent,
  publishEvent,
  editEvent,
  deleteEvent,
} from "../controllers/event_controllers/event.manage.controller.js";

const router = express.Router();

router.post("/save", saveEvent);
router.post("/publish/:id", publishEvent);
router.put("/edit/:id", editEvent);
router.delete("/delete/:id", deleteEvent);

export default router;
