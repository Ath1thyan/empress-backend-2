import User from "../model/UserModel.js";
import CabBooking from "../model/CabBookingModel.js";
import CabRating from "../model/CabRatingModel.js";
import CabPayment from "../model/CabPaymentModel.js";
import CabDriver from '../model/CabDriverModel.js';

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
    console.log(req.user);

    if (!req.user || !req.user.userId) {
        return res.status(400).json({ success: false, message: 'User is not authenticated' });
    }
    
    try {
        const booking = new CabBooking({
            ...req.body,
            customer: req.user.userId,
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
            { bookingStatus: 'Canceled by customer' },
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
    const { bookingId, driverRating, tripRating, comment } = req.body;

    // Check if required fields are present
    if (!bookingId || !driverRating || !tripRating) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Find the booking
        const booking = await CabBooking.findById(bookingId).populate('driver customer');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Create a new rating
        const rating = new CabRating({
            booking: bookingId,
            customer: booking.customer._id,
            driver: booking.driver._id,
            driverRating,
            tripRating,
            comment,
        });

        // Save the rating
        await rating.save();

        // Optionally, you may want to add the rating to the driver's ratings and the booking's ratings
        booking.ratings.push(rating._id);
        await booking.save();

        const driver = await CabDriver.findById(booking.driver._id);
        driver.ratings.push(rating._id);
        await driver.save();

        res.status(201).json({ success: true, rating });
    } catch (error) {
        console.error('Error posting cab rating:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my posted cab ratings
export const getMyCabRatings = async (req, res) => {
    try {
        // console.log('Fetching ratings for user ID:', req.user.userId);
        
        const ratings = await CabRating.find({ customer: req.user.userId });

        if (!ratings.length) {
            console.log('No ratings found for this user.');
        }
        
        res.status(200).json({ success: true, ratings });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my cab posted rating by ID
export const getMyCabRatingById = async (req, res) => {
    try {
        // console.log('Fetching rating for ID:', req.params.id);
        // console.log('Customer ID from req.user:', req.user.userId);
        
        const rating = await CabRating.findOne({ _id: req.params.id, customer: req.user.userId })
            .populate('booking', 'pickupLocation dropoffLocation pickupDate dropoffDate')
            .populate('driver', 'firstName lastName');

        if (!rating) {
            console.log('Rating not found or does not belong to the customer.');
            return res.status(404).json({ success: false, message: 'Rating not found or does not belong to the customer' });
        }

        res.status(200).json({ success: true, rating });
    } catch (error) {
        console.error('Error fetching rating by ID:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete my posted cab rating
export const deleteMyCabRating = async (req, res) => {
    try {
        const rating = await CabRating.findOneAndDelete({ _id: req.params.id, customer: req.user.userId });

        if (!rating) {
            return res.status(404).json({ success: false, message: 'Rating not found or does not belong to the customer' });
        }

        res.status(200).json({ success: true, message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
