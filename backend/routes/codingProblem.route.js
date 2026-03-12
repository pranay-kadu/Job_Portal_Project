import express from "express";
import { createCodingProblem, deleteCodingProblem, getCodingProblems, updateCodingProblem } from "../controllers/codingProblem.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createCodingProblem);
router.route("/get").get(isAuthenticated, getCodingProblems);
router.route("/:id").put(isAuthenticated, updateCodingProblem).delete(isAuthenticated, deleteCodingProblem);

export default router;
