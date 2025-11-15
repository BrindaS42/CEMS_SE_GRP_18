import http from 'http';
import { initializeSocket } from './services/socket.service.js';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import authRouter from './routes/auth.route.js';
import eventRouter from './routes/organizer_routes/event.route.js';
import auth from './middleware/auth.middleware.js';
import profileRouter from './routes/profile.route.js';
const { authentication, authorizeRoles } = auth;
import teamRouter from './routes/organizer_routes/event.team.route.js';
import eventManageRouter from './routes/organizer_routes/event.manage.route.js';
import aiRouter from './routes/ai.route.js';
import studentDashboardRouter from './routes/student_routes/student.dashboard.route.js'
import sponsorRoutes from "./routes/sponsor_routes/sponsor.route.js";
import studentTeamRoutes from "./routes/student_routes/student.team.route.js"; 
import inboxRoute from "./routes/inbox.route.js";
import analyticsRoutes from './routes/organizer_routes/analytics.route.js'; 
import geocodingRouter from './routes/geocoding.route.js';

const app = express();
dotenv.config();

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(cookieParser());
app.use(morgan("dev"));

app.use('/api/auth', authRouter);
app.use('/api/dashboard', eventRouter);
app.use('/api/profile', profileRouter);
app.use('/api/organizer/teams', teamRouter);
app.use('/api/event', eventManageRouter);
app.use('/api/ai', aiRouter); 
app.use('/api/student-dashboard', studentDashboardRouter);
app.use("/api/sponsors", sponsorRoutes);
app.use('/api/event-manage', eventManageRouter);
app.use("/api/student/teams", studentTeamRoutes);
app.use("/api/inbox", inboxRoute);
app.use('/api/analytics', analyticsRoutes); 
app.use('/api/geocode', geocodingRouter);

app.get("/", authentication, authorizeRoles("student","organizer", "sponsor", "admin"), (req, res) => {
  res.send("Campus Event Management Backend Running...");
});

const httpServer = http.createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});