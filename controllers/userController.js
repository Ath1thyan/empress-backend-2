import User from "../model/UserModel.js";
import CabBooking from "../model/CabBookingModel.js";
import CabRating from "../model/CabRatingModel.js";
import CabPayment from "../model/CabPaymentModel.js";

// Helper function to sanitize input (convert to lowercase and remove whitespace)
const sanitizeInput = (value) => {
    return value.toLowerCase().replace(/\s+/g, '');
};

// Get all my cab bookings
export const getMyCabBookings = async (req, res) => {
    try {
        const bookings = await CabBooking.find({ customer: req.user._id })
            .populate('driver')
            .populate('vehicle')
            .populate('payments')
            .populate('ratings');

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my cab booking by ID
export const getMyCabBookingById = async (req, res) => {
    try {
        const booking = await CabBooking.findOne({ _id: req.params.id, customer: req.user._id })
            .populate('driver')
            .populate('vehicle')
            .populate('payments')
            .populate('ratings');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Book a cab
export const bookCab = async (req, res) => {
    try {
        const booking = new CabBooking({
            ...req.body,
            customer: req.user._id,
        });

        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel a cab booking
export const cancelCabBooking = async (req, res) => {
    try {
        const booking = await CabBooking.findOneAndUpdate(
            { _id: req.params.id, customer: req.user._id },
            { bookingStatus: 'Canceled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my cab payments
export const getMyCabPayments = async (req, res) => {
    try {
        const payments = await CabPayment.find({ booking: { $in: req.user.cabBookings } });

        res.status(200).json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my cab payment by ID
export const getMyCabPaymentById = async (req, res) => {
    try {
        const payment = await CabPayment.findOne({ _id: req.params.id, booking: { $in: req.user.cabBookings } });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Post rating and review for a cab ride
export const postCabRating = async (req, res) => {
    try {
        const rating = new CabRating({
            ...req.body,
            customer: req.user._id,
        });

        await rating.save();
        res.status(201).json({ success: true, rating });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my posted cab ratings
export const getMyCabRatings = async (req, res) => {
    try {
        const ratings = await CabRating.find({ customer: req.user._id });

        res.status(200).json({ success: true, ratings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my cab posted rating by ID
export const getMyCabRatingById = async (req, res) => {
    try {
        const rating = await CabRating.findOne({ _id: req.params.id, customer: req.user._id });

        if (!rating) {
            return res.status(404).json({ success: false, message: 'Rating not found' });
        }

        res.status(200).json({ success: true, rating });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete my posted cab rating
export const deleteMyCabRating = async (req, res) => {
    try {
        const rating = await CabRating.findOneAndDelete({ _id: req.params.id, customer: req.user._id });

        if (!rating) {
            return res.status(404).json({ success: false, message: 'Rating not found' });
        }

        res.status(200).json({ success: true, message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
