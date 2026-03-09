import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId("698f890bb088da765b8c022a") });
        if (user) {
            process.stderr.write(`FOUND: Email: ${user.email}, ID: ${user._id.toString()}\n`);
        } else {
            process.stderr.write("NOT FOUND\n");
        }
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

check();
