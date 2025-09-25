import mongoose from 'mongoose';
import 'dotenv/config';

async function connectDB() {

    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');
    }catch(err){
        console.error('Database connection error:', err);
        process.exit(1);
    }

}

export default connectDB;