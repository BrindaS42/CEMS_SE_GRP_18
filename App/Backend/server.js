import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.route.js";
import eventRouter from "./routes/event.route.js";
import auth from "./middleware/auth.middleware.js";
import profileRouter from "./routes/profile.route.js";
const { authentication, authorizeRoles } = auth;
import teamRouter from "./routes/event.team.route.js";
import eventManageRouter from "./routes/event.manage.route.js";
import aiRouter from "./routes/ai.route.js";
import sponsorRoutes from "./routes/sponsor.route.js";
import inboxRoute from "./routes/inbox.route.js";

const app = express();
dotenv.config();

connectDB();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/dashboard", eventRouter);
app.use("/api/profile", profileRouter);
app.use("/api/team", teamRouter);
app.use("/api/event", eventManageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/sponsors", sponsorRoutes);
app.use("/api/inbox", inboxRoute);

app.get(
  "/",
  authentication,
  authorizeRoles("student", "organizer"),
  (req, res) => {
    res.send("Campus Event Management Backend Running...");
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
