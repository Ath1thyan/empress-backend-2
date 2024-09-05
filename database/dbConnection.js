import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function dbConnection() {
    mongoose.set('strictQuery', true);
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected");
        return db;
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        throw error; // Ensure the error is thrown to catch in the main app logic
    }
}

export default dbConnection;