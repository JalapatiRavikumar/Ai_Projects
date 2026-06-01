import mongoose from "mongoose";
import { config } from "./config.js";

// Enable buffering to handle connection delays gracefully
// Commands will be buffered until connection is established
mongoose.set('bufferCommands', true);

export const connectDB = async () =>{
    try {
        if (!config.MONGO_URI) {
            console.warn('⚠️  MONGO_URI is not defined in config file');
            return false;
        }
        
        await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });
        console.log('✅ MongoDB connected successfully');
        return true;
    } catch (error) {
        if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
            console.error('❌ MongoDB authentication failed. Check MONGO_URI and Atlas user/password.');
        } else {
            console.error('❌ MongoDB Connection Error:', error.message);
        }
        console.warn('   Server will start but database operations will fail');
        return false;
    }
}