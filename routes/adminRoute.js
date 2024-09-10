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
    blockUser
} from '../controllers/adminController.js';

const router = express.Router();

// Users Routes
router.get('/users', getAllUsers);  // Get all users
router.get('/users/:id', getUserById);  // Get user by ID
router.patch('/users/block/:id', blockUser);  // Block a user

// Cab Drivers Routes
router.get('/drivers', getAllCabDrivers);  // Get all cab drivers
router.get('/drivers/:id', getCabDriverById);  // Get cab driver by ID
router.post('/drivers/add-driver', addCabDriver);  // Add a new cab driver
router.put('/drivers/update-driver/:id', editCabDriverInfo);  // Edit a cab driver's information
router.delete('/drivers/delete-driver/:id', deleteCabDriver);  // Delete a cab driver

// Cabs Routes
router.get('/cabs', getAllCabs);  // Get all cabs
router.get('/cabs/:id', getCabById);  // Get cab by ID
router.post('/cabs/add-cab', addCab);  // Add a new cab
router.put('/cabs/update-cab/:id', editCabInfo);  // Edit a cab's information
router.delete('/cabs/delete-cab/:id', deleteCab);  // Delete a cab

export default router;
