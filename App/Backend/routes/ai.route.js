import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { getRecommendations, getContentBasedRecommendations, queryChatBot, rebuildSearchIndex } from "../controllers/ai.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

router.get(
  "/recommend",
  authentication,
  authorizeRoles("student"),
  getRecommendations
);

router.get(
  "/recommend/content-based",
  authentication,
  authorizeRoles("student"),
  getContentBasedRecommendations
);

router.post(
    "/bot",
    authentication,
    authorizeRoles("student", "organizer", "sponsor"),
    queryChatBot
  );

router.post(
  "/rebuild-index",
  authentication,
  authorizeRoles("admin"),
  rebuildSearchIndex
);

export default router;
