import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const reportsCount = await db.collection('interviewreports').countDocuments();
        const sessionsCount = await db.collection('interviewsessions').countDocuments();
        const configsCount = await db.collection('interviewconfigs').countDocuments();
        
        console.log(`Total InterviewReports: ${reportsCount}`);
        console.log(`Total InterviewSessions: ${sessionsCount}`);
        console.log(`Total InterviewConfigs: ${configsCount}`);
        
        if (reportsCount > 0) {
            const sample = await db.collection('interviewreports').findOne();
            console.log('Sample Report UserID:', sample.user_id);
            console.log('Sample Report SessionID:', sample.session_id);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
