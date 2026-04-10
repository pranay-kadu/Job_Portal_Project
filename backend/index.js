import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import openaiRoute from "./routes/openai.route.js";
import http from 'http';
import { initializeWebSocket } from './interview-bot-merged/config/websocket.js';
import configRoutes from './interview-bot-merged/routes/configRoutes.js';
import interviewRoutes from './interview-bot-merged/routes/interviewRoutes.js';
import reportRoutes from './interview-bot-merged/routes/reportRoutes.js';
import monitoringRoutes from './interview-bot-merged/routes/monitoringRoutes.js';
import isAuthenticated from "./middlewares/isAuthenticated.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import aiRoute from "./routes/aiRoute.js";
import codingProblemRoute from "./routes/codingProblem.route.js";
import codingRoute from "./routes/coding.route.js";




// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
initializeWebSocket(server);
const PORT = process.env.PORT || 8000;

/* -------------------- Middleware -------------------- */
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


/* -------------------- Routes -------------------- */
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/openai", openaiRoute);

// Interview Bot Routes
app.use('/api/config', isAuthenticated, configRoutes);
app.use('/api/interview', isAuthenticated, interviewRoutes);
app.use('/api/report', isAuthenticated, reportRoutes);
app.use('/api/monitoring', isAuthenticated, monitoringRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoute);
app.use('/api/v1/coding-problems', codingProblemRoute);
app.use('/api/v1/coding', codingRoute);




app.get("/", (req, res) => {
  res.send("API is running...");
});

/* -------------------- Start Server -------------------- */
server.listen(PORT, async () => {
  await connectDB();
  console.log(` Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

// Final error handler for any uncaught errors in controllers
app.use((err, req, res, next) => {
  console.error("Uncaught Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
