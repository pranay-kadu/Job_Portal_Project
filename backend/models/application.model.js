import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected'],
        default:'pending'
    },
    trackingSteps: [
        {
            name: { type: String },
            status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
            date: { type: Date }
        }
    ],
    currentStep: {
        type: Number,
        default: 0
    }
},{timestamps:true});
export const Application  = mongoose.model("Application", applicationSchema);