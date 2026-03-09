import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('--- SYSTEM USERS START ---');
        users.forEach(u => {
            console.log(`EMAIL:${u.email}|ID:${u._id.toString()}`);
        });
        console.log('--- SYSTEM USERS END ---');
        
        const reports = await mongoose.connection.db.collection('interviewreports').find({}).toArray();
        console.log('--- SYSTEM REPORTS START ---');
        reports.forEach(r => {
            console.log(`REPORT:${r._id}|USER:${r.user_id}`);
        });
        console.log('--- SYSTEM REPORTS END ---');

        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

check();
