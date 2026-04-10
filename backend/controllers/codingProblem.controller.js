import { CodingProblem } from "../models/codingProblem.model.js";

export const createCodingProblem = async (req, res) => {
    try {
        const { title, description, difficulty, examples, testCases } = req.body;

        if (!title || !description || !difficulty || !examples || !testCases) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        const codingProblem = await CodingProblem.create({
            title,
            description,
            difficulty: difficulty.toLowerCase(),
            examples,
            testCases
        });

        return res.status(201).json({
            message: "Problem created successfully",
            codingProblem,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const getCodingProblems = async (req, res) => {
    console.log("DEBUG: getCodingProblems controller entered");
    try {
        const problems = await CodingProblem.find().sort({ createdAt: -1 });
        console.log("DEBUG: found problems:", problems.length);
        return res.status(200).json({
            problems,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const deleteCodingProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await CodingProblem.findByIdAndDelete(id);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Problem deleted successfully",
            success: true
        });
    } catch (error) {
        console.log("Delete Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const updateCodingProblem = async (req, res) => {
    try {
        const problemId = req.params.id;
        const { title, description, difficulty, examples, testCases } = req.body;

        let updateData = { title, description, examples, testCases };
        if (difficulty) {
            updateData.difficulty = difficulty.toLowerCase();
        }

        const problem = await CodingProblem.findByIdAndUpdate(problemId, updateData, { new: true });

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Problem updated successfully",
            success: true,
            problem
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
