import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createDraft,
  editDraft,
  deleteDraft,
  getListOfDrafts,
  sendMessage,
  sendDirectMessage,
  getListOfSents,
  getListOfArrivals,
} from "../controllers/inbox.controller.js";
import {
  approveInboxEntity,
  rejectInboxEntity,
} from "../controllers/inbox.controller.js";

const { authentication, authorizeRoles, checkSuspension} = auth;
const router = Router();

// All routes require authentication
router.use(authentication);

router.post("/drafts", checkSuspension, createDraft);                    // Create Draft
router.put("/drafts/:draftId",checkSuspension, editDraft);             // Edit Draft
router.delete("/drafts/:draftId",checkSuspension, deleteDraft);        // Delete Draft
router.get("/drafts", getListOfDrafts);                // Get List of Drafts

router.post("/send", checkSuspension, sendDirectMessage);               // Send Message Directly
router.put("/drafts/:draftId/send", checkSuspension,sendMessage);      // Send Message (Draft -> Sent)
router.get("/sent", getListOfSents);                   // Get List of Sent Messages

router.get("/arrivals", getListOfArrivals);            // Get List of Arrivals
router.put("/approve/:id", checkSuspension, approveInboxEntity);
router.put("/reject/:id", checkSuspension,rejectInboxEntity);


export default router;