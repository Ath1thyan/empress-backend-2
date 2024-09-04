import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function dbConnection() {
    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected")
    return db;
}

export default dbConnection;