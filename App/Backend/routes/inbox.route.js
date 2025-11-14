import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createDraft,
  editDraft,
  deleteDraft,
  getListOfDrafts,
  sendMessage,
  getListOfSents,
  getListOfArrivals,
} from "../controllers/inbox.controller.js";

const { authentication } = auth;
const router = Router();

// All routes require authentication
router.use(authentication);

router.post("/drafts", createDraft);                    // Create Draft
router.put("/drafts/:draftId", editDraft);             // Edit Draft
router.delete("/drafts/:draftId", deleteDraft);        // Delete Draft
router.get("/drafts", getListOfDrafts);                // Get List of Drafts

router.put("/drafts/:draftId/send", sendMessage);      // Send Message (Draft -> Sent)
router.get("/sent", getListOfSents);                   // Get List of Sent Messages

router.get("/arrivals", getListOfArrivals);            // Get List of Arrivals

export default router;