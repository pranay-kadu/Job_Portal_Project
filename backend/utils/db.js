import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected. Reconnecting...");
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB Error:", err);
});
export default connectDB;