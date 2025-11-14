import express from "express";
import {
  approveInboxEntity,
  rejectInboxEntity,
} from "../controllers/inbox.controller.js";

const router = express.Router();
router.put("/approve/:id", approveInboxEntity);
router.put("/reject/:id", rejectInboxEntity);

export default router;
