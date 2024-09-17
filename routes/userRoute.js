import express from 'express';
const router = express.Router();

import {
    getMyCabBookings,
    getMyCabBookingById,
    bookCab,
    cancelCabBooking,
    getMyCabPayments,
    getMyCabPaymentById,
    postCabRating,
    getMyCabRatings,
    getMyCabRatingById,
    deleteMyCabRating,
} from '../controllers/userController.js';

import Auth from '../middleware/auth.js';


/** CABS */
/** GET Methods */
router.route('/cabs/mycabbookings').get(Auth, getMyCabBookings);
router.route('/cabs/mycabbooking/:id').get(Auth, getMyCabBookingById);
router.route('/cabs/mycabs').get(Auth, getMyCabPayments);
router.route('/cabs/mycabpayment/:id').get(Auth, getMyCabPaymentById);
router.route('/cabs/myratings').get(Auth, getMyCabRatings);
router.route('/cabs/myrating/:id').get(Auth, getMyCabRatingById);
/** POST Methods */
router.route('/cabs/bookcab').post(Auth, bookCab);
router.route('/cabs/cancelcabbooking/:id').post(Auth, cancelCabBooking);
router.route('/cabs/ratecab').post(Auth, postCabRating);
/** DELETE Method */
router.route('/cabs/deleterating/:id').delete(Auth, deleteMyCabRating);

export default router;