import Cab from "../model/CabModel.js";
import CabDriver from "../model/CabDriverModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

// Helper function to sanitize input (convert to lowercase and remove whitespace)
const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;  // Return the value as is if it's not a string
    return value.toLowerCase().replace(/\s+/g, '');
};

/**
 * Cab driver login
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const driver = await CabDriver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ driverId: driver._id, email: driver.email }, secretKey, { expiresIn: '1d' });
        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Login failed", error });
    }
};

/**
 * Get profile info for the logged-in cab driver
 */
export const getProfileInfo = async (req, res) => {
    if (req.driverId) {
        req.driverId = sanitizeInput(req.driverId);
    }
    const driverId = req.driverId;  // Assume driverId is extracted from the token in middleware

    try {
        const driver = await CabDriver.findById(driverId).select('-password');
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        return res.status(200).json({ success: true, driver });
    } catch (error) {
        console.error("Error fetching driver profile:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve profile", error });
    }
};

/**
 * Get cab information for the logged-in driver
 */
export const getMyCabInfo = async (req, res) => {
    if (req.driverId) {
        req.driverId = sanitizeInput(req.driverId);
    }

    let driverId = req.driverId;  // Assume driverId is extracted from the token in middleware
    console.log('Driver ID from getMyCabInfo: ', driverId);

    try {
        // Find driver ID from the driver objectID
        const driver = await CabDriver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }
        driverId = driver.driverId
        console.log('Driver ID from getMyCabInfo: ', driverId);
        // Find the cab linked to the driver's `driverId` (not ObjectId)
        const cab = await Cab.findOne({ driver: driverId });
        console.log(cab);
        
        if (!cab) {
            return res.status(404).json({ success: false, message: "Cab not found for this driver" });
        }

        return res.status(200).json({ success: true, cab });
    } catch (error) {
        console.error("Error fetching cab info:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve cab info", error });
    }
};


/**
 * Update cab trip status (e.g., 'Available', 'On Trip', 'Booking Received', etc.)
 */
export const updateCabTripStatus = async (req, res) => {
    const { tripStatus } = req.body;
    let driverId = req.driverId;  // Assume driverId is extracted from the token in middleware

    try {
        // Find driver ID from the driver objectID
        const driver = await CabDriver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }
        driverId = driver.driverId
        
        const cab = await Cab.findOneAndUpdate({ driver: driverId }, { tripStatus }, { new: true });
        if (!cab) {
            return res.status(404).json({ success: false, message: "Cab not found for this driver" });
        }

        return res.status(200).json({ success: true, message: "Trip status updated", cab });
    } catch (error) {
        console.error("Error updating trip status:", error);
        return res.status(500).json({ success: false, message: "Failed to update trip status", error });
    }
};

/**
 * Update driver duty status (e.g., 'Available', 'On Duty', 'Off Duty')
 */
export const updateDriverDutyStatus = async (req, res) => {
    const { dutyStatus } = req.body;
    const driverId = req.driverId;  // Assume driverId is extracted from the token in middleware

    try {
        const driver = await CabDriver.findByIdAndUpdate(driverId, { dutyStatus }, { new: true });
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        return res.status(200).json({ success: true, message: "Duty status updated", driver });
    } catch (error) {
        console.error("Error updating duty status:", error);
        return res.status(500).json({ success: false, message: "Failed to update duty status", error });
    }
};
