import express from "express";
import { executeCode } from "../controllers/coding.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/execute").post(isAuthenticated, executeCode);

export default router;
