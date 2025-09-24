import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';


import connectDB from './config/database.js';
import authRouter from './routes/auth.route.js';

const app = express();
dotenv.config();

connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); 

app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
  res.send("Campus Event Management Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
