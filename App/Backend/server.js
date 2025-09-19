import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(cors);
app.use(express.json());
app.use(morgan("dev")); 


app.get("/", (req, res) => {
  res.send("Campus Event Management Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
