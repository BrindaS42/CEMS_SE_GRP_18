import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { getRecommendations, queryChatBot } from "../controllers/ai.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

router.get(
  "/recommend",
  authentication,
  authorizeRoles("student"),
  getRecommendations
);

router.post(
    "/bot",
    authentication,
    authorizeRoles("student", "organizer", "sponsor"),
    queryChatBot
  );
  

export default router;
