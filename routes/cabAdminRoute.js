import express from 'express';
import {
    getAllUsers,
    getUserById,
    getAllCabDrivers,
    getCabDriverById,
    getAllCabs,
    getCabById,
    addCab,
    addCabDriver,
    editCabInfo,
    editCabDriverInfo,
    deleteCab,
    deleteCabDriver,
    blockUser,
    unblockUser,
    getAllBookings,
    getAllReviews,
    getAllPaymentDetails,
    getBookingById,
    getReviewById,
    getPaymentDetailById
} from '../controllers/cabAdminController.js';
import { adminAuthMiddleware, limosAdminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Users Routes - Only accessible by Limos Admin
router.get('/users', adminAuthMiddleware, limosAdminMiddleware, getAllUsers);  // Get all users
router.get('/users/:id', adminAuthMiddleware, limosAdminMiddleware, getUserById);  // Get user by ID
router.patch('/users/block/:id', adminAuthMiddleware, limosAdminMiddleware, blockUser);  // Block a user
router.patch('/users/unblock/:id', adminAuthMiddleware, limosAdminMiddleware, unblockUser);  // Unblock a user

// Cab Drivers Routes - Only accessible by Limos Admin
router.get('/drivers', adminAuthMiddleware, limosAdminMiddleware, getAllCabDrivers);  // Get all cab drivers
router.get('/drivers/:id', adminAuthMiddleware, limosAdminMiddleware, getCabDriverById);  // Get cab driver by ID
router.post('/drivers/add-driver', adminAuthMiddleware, limosAdminMiddleware, addCabDriver);  // Add a new cab driver
router.put('/drivers/update-driver/:id', adminAuthMiddleware, limosAdminMiddleware, editCabDriverInfo);  // Edit a cab driver's information
router.delete('/drivers/delete-driver/:id', adminAuthMiddleware, limosAdminMiddleware, deleteCabDriver);  // Delete a cab driver

// Cabs Routes - Only accessible by Limos Admin
router.get('/cabs', getAllCabs);  // Get all cabs
router.get('/cabs/:id', adminAuthMiddleware, limosAdminMiddleware, getCabById);  // Get cab by ID
router.post('/cabs/add-cab', adminAuthMiddleware, limosAdminMiddleware, addCab);  // Add a new cab
router.put('/cabs/update-cab/:id', adminAuthMiddleware, limosAdminMiddleware, editCabInfo);  // Edit a cab's information
router.delete('/cabs/delete-cab/:id', adminAuthMiddleware, limosAdminMiddleware, deleteCab);  // Delete a cab

// Bookings Routes - Only accessible by Limos Admin
router.get('/bookings', adminAuthMiddleware, limosAdminMiddleware, getAllBookings);  // Get all bookings
router.get('/booking/:id', adminAuthMiddleware, limosAdminMiddleware, getBookingById);  // Get booking by ID

// Reviews Routes - Only accessible by Limos Admin
router.get('/reviews', adminAuthMiddleware, limosAdminMiddleware, getAllReviews);  // Get all reviews
router.get('/reviews/:id', adminAuthMiddleware, limosAdminMiddleware, getReviewById);  // Get review by ID

// Payment Details Routes - Only accessible by Limos Admin
router.get('/payment-details', adminAuthMiddleware, limosAdminMiddleware, getAllPaymentDetails);  // Get all payment details
router.get('/payment-details/:id', adminAuthMiddleware, limosAdminMiddleware, getPaymentDetailById);  // Get payment detail by ID


// Export the router
export default router;
