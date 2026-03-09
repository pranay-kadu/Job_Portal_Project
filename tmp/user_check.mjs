import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u._id.toString()}, Email: ${u.email}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
