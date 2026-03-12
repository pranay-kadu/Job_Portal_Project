import mongoose from "mongoose";

const codingProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    examples: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],
    testCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            isHidden: { type: Boolean, default: false }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const CodingProblem = mongoose.model("CodingProblem", codingProblemSchema);
