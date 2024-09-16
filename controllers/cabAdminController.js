import Cab from "../model/CabModel.js";
import CabDriver from "../model/CabDriverModel.js";
import User from "../model/UserModel.js";
import bcrypt from "bcryptjs";
import { sendMail } from "./mailer.js";

// Helper function to sanitize input (convert to lowercase and remove whitespace)
const sanitizeInput = (value) => {
    return value.toLowerCase().replace(/\s+/g, '');
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch users", error });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch user", error });
    }
};

// Get all cab drivers
export const getAllCabDrivers = async (req, res) => {
    try {
        const drivers = await CabDriver.find();
        return res.status(200).json({ success: true, drivers });
    } catch (error) {
        console.error("Error fetching cab drivers:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch drivers", error });
    }
};

// Get cab driver by ID
export const getCabDriverById = async (req, res) => {
    try {
        const driver = await CabDriver.findById(req.params.id).populate('vehicle');
        if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
        return res.status(200).json({ success: true, driver });
    } catch (error) {
        console.error("Error fetching driver:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch driver", error });
    }
};

// Get all cabs
export const getAllCabs = async (req, res) => {
    try {
        const cabs = await Cab.find();
        return res.status(200).json({ success: true, cabs });
    } catch (error) {
        console.error("Error fetching cabs:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch cabs", error });
    }
};

// Get cab by ID
export const getCabById = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id).populate('driver');
        if (!cab) return res.status(404).json({ success: false, message: "Cab not found" });
        return res.status(200).json({ success: true, cab });
    } catch (error) {
        console.error("Error fetching cab:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch cab", error });
    }
};

// Add a new cab
export const addCab = async (req, res) => {
    try {
        // Sanitize license plate and driver fields
        req.body.licensePlate = sanitizeInput(req.body.licensePlate);
        req.body.driver = sanitizeInput(req.body.driver);

        const newCab = new Cab(req.body);
        await newCab.save();
        return res.status(201).json({ success: true, message: "Cab added successfully", cab: newCab });
    } catch (error) {
        console.error("Error adding cab:", error);
        return res.status(500).json({ success: false, message: "Failed to add cab", error });
    }
};

// Add a new cab driver
export const addCabDriver = async (req, res) => {
    try {
        const { firstName, lastName, email, vehicle } = req.body;

        // Sanitize driverId and vehicle
        req.body.driverId = sanitizeInput(req.body.driverId);
        req.body.vehicle = sanitizeInput(vehicle);

        // Generate random password
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const newDriver = new CabDriver({
            ...req.body,
            password: hashedPassword
        });
        await newDriver.save();

        // Send email to driver
        const mailOptions = {
            to: email,
            subject: "Your Cab Driver Account",
            text: `Dear ${firstName} ${lastName},\n\nYou have been registered as a driver. Your login email is ${email} and your password is ${generatedPassword}. Your vehicle ID is ${vehicle}.\n\nBest regards,\nEmpress Team`
        };
        await sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "Driver added and email sent", driver: newDriver });
    } catch (error) {
        console.error("Error adding cab driver:", error);
        return res.status(500).json({ success: false, message: "Failed to add driver", error });
    }
};

// Edit cab info
export const editCabInfo = async (req, res) => {
    try {
        if (req.body.licensePlate) {
            req.body.licensePlate = sanitizeInput(req.body.licensePlate);
        }
        if (req.body.driver) {
            req.body.driver = sanitizeInput(req.body.driver);
        }

        const updatedCab = await Cab.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCab) return res.status(404).json({ success: false, message: "Cab not found" });
        return res.status(200).json({ success: true, message: "Cab info updated", cab: updatedCab });
    } catch (error) {
        console.error("Error updating cab:", error);
        return res.status(500).json({ success: false, message: "Failed to update cab", error });
    }
};

// Edit cab driver info
export const editCabDriverInfo = async (req, res) => {
    try {
        if (req.body.driverId) {
            req.body.driverId = sanitizeInput(req.body.driverId);
        }
        if (req.body.vehicle) {
            req.body.vehicle = sanitizeInput(req.body.vehicle);
        }
        
        const updatedDriver = await CabDriver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDriver) return res.status(404).json({ success: false, message: "Driver not found" });
        return res.status(200).json({ success: true, message: "Driver info updated", driver: updatedDriver });
    } catch (error) {
        console.error("Error updating driver:", error);
        return res.status(500).json({ success: false, message: "Failed to update driver", error });
    }
};

// Delete a cab
export const deleteCab = async (req, res) => {
    try {
        const deletedCab = await Cab.findByIdAndDelete(req.params.id);
        if (!deletedCab) return res.status(404).json({ success: false, message: "Cab not found" });
        return res.status(200).json({ success: true, message: "Cab deleted" });
    } catch (error) {
        console.error("Error deleting cab:", error);
        return res.status(500).json({ success: false, message: "Failed to delete cab", error });
    }
};

// Delete a cab driver
export const deleteCabDriver = async (req, res) => {
    try {
        const deletedDriver = await CabDriver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) return res.status(404).json({ success: false, message: "Driver not found" });
        return res.status(200).json({ success: true, message: "Driver deleted" });
    } catch (error) {
        console.error("Error deleting driver:", error);
        return res.status(500).json({ success: false, message: "Failed to delete driver", error });
    }
};

// Block user
export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        
        user.isBlocked = true;
        await user.save();

        return res.status(200).json({ success: true, message: "User blocked" });
    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({ success: false, message: "Failed to block user", error });
    }
};

// Unblock user
export const unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        
        user.isBlocked = false;
        await user.save();

        return res.status(200).json({ success: true, message: "User unblocked" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({ success: false, message: "Failed to unblock user", error });
    }
};

// List all bookings
export const getAllBookings = async (req, res) => {
};

// Get booking by ID
export const getBookingById = async (req, res) => {
};

// Get all reviews
export const getAllReviews = async (req, res) => {
};

// Get review by ID
export const getReviewById = async (req, res) => {
};

// Get all payment details
export const getAllPaymentDetails = async (req, res) => {
};

// Get payment detail by ID
export const getPaymentDetailById = async (req, res) => {
};

// 