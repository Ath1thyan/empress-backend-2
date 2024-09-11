import express from "express";
const router = express.Router();

// Import controllers
import { login, getProfileInfo, getMyCabInfo, updateCabTripStatus, updateDriverDutyStatus } from "../controllers/cabDriverController.js";
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

export default router;
