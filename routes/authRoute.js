import express from "express";
const router = express.Router();


/** Import controllers */
import { register, login, getUser, updateUser, generateOTP, verifyOTP, createResetSession, resetPassword, resendVerificationEmail, logout, deleteUser, forgotPassword, verifyUser } from '../controllers/authController.js';
import Auth, { localVariables } from '../middleware/auth.js';
import { registerMail } from "../controllers/mailer.js";


/** POST Methods */
router.route('/register').post(register);    // register
router.route('/registerMail').post(registerMail);   // send the email
router.route('/authenticate').post();  // authenticate user
router.route('/login').post(verifyUser, login);  // login
// router.route('/forgotPassword').post(forgotPassword);  // forgot password
router.route('/resendVerification').post(resendVerificationEmail);  // resend verification email

/** GET Methods */
router.route('/logout').get(logout);  // logout
router.route('/user/:email').get(getUser);  // user with username
router.route('/generateOTP').get(verifyUser, localVariables, generateOTP);   // generate random OTP
router.route('/verifyOTP').get(verifyOTP);   // verify generated OTP
router.route('/createResetSession').get(createResetSession);  // reset all the variables

/** PUT Methods */
router.route('/updateuser').put(Auth, updateUser);  // update the user profile
router.route('/resetPassword').put(verifyUser, resetPassword);   // reset password

/** DELETE Methods */
router.route('/deleteuser').delete(Auth, deleteUser);  // delete user


export default router;