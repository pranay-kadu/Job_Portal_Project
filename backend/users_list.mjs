import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, ID: ${u._id.toString()}`);
        });
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

check();
