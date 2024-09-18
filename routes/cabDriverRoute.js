import express from "express";
const router = express.Router();

// Import controllers
import { login, getProfileInfo, getMyCabInfo, updateCabTripStatus, updateDriverDutyStatus, getPreviousBookings, getNewBookings, updateBookingStatus, getUpcomingBooking, getBookingById, getMyRatings, getRatingById } from "../controllers/cabDriverController.js";
import CabDriverAuth from "../middleware/cabDriver.js";

// Login route (no authentication needed)
router.post("/login", login);

// Get profile info (protected route, requires authentication)
router.get("/profile", CabDriverAuth, getProfileInfo);

// Get assigned cab info (protected route, requires authentication)
router.get("/my-cab", CabDriverAuth, getMyCabInfo);

// Update cab trip status (protected route, requires authentication)
router.patch("/cab/trip-status", CabDriverAuth, updateCabTripStatus);

// Update driver duty status (protected route, requires authentication)
router.patch("/duty-status", CabDriverAuth, updateDriverDutyStatus);

// Get previous bookings (protected route, requires authentication)
router.get("/previous-bookings", CabDriverAuth, getPreviousBookings);

// Get new bookings (protected route, requires authentication)
router.get("/new-bookings", CabDriverAuth, getNewBookings);

// Update booking status (protected route, requires authentication)
router.patch("/booking-status/:bookingId", CabDriverAuth, updateBookingStatus);

// Get upcoming booking (protected route, requires authentication)
router.get("/upcoming-booking", CabDriverAuth, getUpcomingBooking);

// Get booking by ID (protected route, requires authentication)
router.get("/booking/:bookingId", CabDriverAuth, getBookingById);

// Get my ratings (protected route, requires authentication)
router.get("/ratings", CabDriverAuth, getMyRatings);

// Get rating by ID (protected route, requires authentication)
router.get("/rating/:ratingId", CabDriverAuth, getRatingById);

export default router;
