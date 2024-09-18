import Cab from "../model/CabModel.js";
import CabDriver from "../model/CabDriverModel.js";
import CabBooking from "../model/CabBookingModel.js";
import CabRating from "../model/CabRatingModel.js"
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

    try {
        // Find driver ID from the driver objectID
        const driver = await CabDriver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }
        driverId = driver.driverId
        // Find the cab linked to the driver's `driverId` (not ObjectId)
        const cab = await Cab.findOne({ driver: driverId });

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
    const driverId = req.driverId;  // Assume driverId is extracted from the token in middleware

    try {
        // Check if the driver exists
        const driver = await CabDriver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        // Update the cab's trip status associated with the driver
        const cab = await Cab.findOneAndUpdate({ driver: driver._id }, { tripStatus }, { new: true });
        if (!cab) {
            return res.status(404).json({ success: false, message: "Cab not found for this driver" });
        }

        return res.status(200).json({ success: true, message: "Trip status updated successfully", cab });
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


/**
 * Get previous bookings for the logged-in driver
 */
export const getPreviousBookings = async (req, res) => {
    const driverId = req.driverId;

    try {
        const previousBookings = await CabBooking.find({ driver: driverId, bookingStatus: 'Completed' })
            .populate('customer', 'firstName lastName email')
            .populate('vehicle', 'make model licensePlate')
            .sort({ pickupDate: -1 });

        return res.status(200).json({ success: true, bookings: previousBookings });
    } catch (error) {
        console.error("Error fetching previous bookings:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve previous bookings", error });
    }
};

/**
 * Get new bookings (pending or confirmed) for the logged-in driver
 */
export const getNewBookings = async (req, res) => {
    const driverId = req.driverId; // Extracted from token in middleware

    try {
        const newBookings = await CabBooking.find({ driver: driverId, bookingStatus: { $in: ['Pending', 'Confirmed'] } })
            .populate('customer', 'firstName lastName email') // Populate customer info
            .populate('vehicle', 'make model licensePlate') // Populate vehicle info
            .sort({ pickupDate: 1 }); // Sort by pickupDate in ascending order (upcoming first)

        return res.status(200).json({ success: true, bookings: newBookings });
    } catch (error) {
        console.error("Error fetching new bookings:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve new bookings", error });
    }
};

/**
 * Get booking by Id
 */
export const getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await CabBooking.findById(bookingId)
            .populate('customer', 'firstName lastName email')
            .populate('vehicle', 'make model licensePlate');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({ success: true, booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve booking", error });
    }
};


// update booking status
export const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params; // Get bookingId from URL parameters
    const { bookingStatus } = req.body; // Get bookingStatus from request body
    const driverId = sanitizeInput(req.driverId); // Sanitize driverId

    try {
        // Verify that the driver is allowed to update this booking (optional, add logic if needed)

        // Find and update the booking status
        const booking = await CabBooking.findByIdAndUpdate(
            bookingId,
            { bookingStatus },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update booking status",
            error
        });
    }
};


/**
 * Get upcoming booking for the logged-in driver
 */
export const getUpcomingBooking = async (req, res) => {
    const driverId = req.driverId;

    try {
        const booking = await CabBooking.findOne({ driver: driverId, bookingStatus: 'Confirmed' })
            .populate('customer', 'firstName lastName email')
            .populate('vehicle', 'make model licensePlate')
            .sort({ pickupDate: 1 });

        if (!booking) {
            return res.status(404).json({ success: false, message: "No upcoming booking found" });
        }

        return res.status(200).json({ success: true, booking });
    } catch (error) {
        console.error("Error fetching upcoming booking:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve upcoming booking", error });
    }
};


// get my ratings
export const getMyRatings = async (req, res) => {
    const driverId = req.driverId;

    try {
        const ratings = await CabRating.find({ driver: driverId }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, ratings });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve ratings", error });
    }
};

// get my rating by ID
export const getRatingById = async (req, res) => {
    const { ratingId } = req.params;

    try {
        const rating = await CabRating.findById(ratingId);

        if (!rating) {
            return res.status(404).json({ success: false, message: "Rating not found" });
        }

        return res.status(200).json({ success: true, rating });
    } catch (error) {
        console.error("Error fetching rating:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve rating", error });
    }
};