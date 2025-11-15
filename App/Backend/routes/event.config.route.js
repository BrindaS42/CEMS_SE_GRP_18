import express from "express";
import {
  createOrUpdateEventConfig,
  getEventConfig,
} from "../controllers/event_controllers/event.config.controller.js";

const router = express.Router();

// POST - Create or Update Event Config
router.post("/gett", createOrUpdateEventConfig);

// GET - Fetch Event Config by eventId
router.get("/:eventId", getEventConfig);

export default router;
