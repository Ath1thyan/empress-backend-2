import UserModel from '../model/UserModel.js'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import otpGenerator from 'otp-generator';
import { sendMail } from './mailer.js';
import cloudinary from "../utils/cloudinary.js"

/** Load environment variables */
dotenv.config();


/** middleware for verify user */
export async function verifyUser(req, res, next) {
    try {
        const { username, email, mobile } = req.method === "GET" ? req.query : req.body;

        // Find the user by username, email, or mobile
        const user = await UserModel.findOne({
            $or: [{ username }, { email }, { mobile }],
        });

        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: "false"
            });
        }

        // Attach user to request object for further use
        req.user = user;
        next();

    } catch (error) {
        console.error('Error in verifyUser middleware:', error);
        return res.status(500).send({ error: "Server Error" });
    }
}


/** POST: http://localhost:8080/api/test/auth/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "salutation": "Mr",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "zipcode" : "30305"
  "profile": ""
}
*/
export async function register(req, res) {
    try {
        const { username, password, profile, email, mobile, salutation, firstName, lastName } = req.body;

        // Gather missing fields
        const missingFields = [];
        if (!username) missingFields.push('username');
        if (!password) missingFields.push('password');
        if (!email) missingFields.push('email');
        if (!mobile) missingFields.push('mobile');
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');

        // Check for missing fields
        if (missingFields.length > 0) {
            return res.status(400).send({
                success: false,
                message: `Please provide all the required fields: ${missingFields.join(', ')}`,
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).send({
                success: false,
                message: 'Password should be at least 8 characters long',
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid email format. It should be in the format "username@domain.com"',
            });
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).send({
                success: false,
                message: 'Username should only contain alphanumeric characters',
            });
        }

        // Validate mobile number
        const mobileRegex = /^[0-9]{6,15}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid mobile number format. It should be between 6 and 15 digits',
            });
        }

        // Check if the username or email already exists
        const [existingUsername, existingEmail] = await Promise.all([
            UserModel.findOne({ username }),
            UserModel.findOne({ email }),
        ]);

        if (existingUsername) {
            return res.status(400).send({
                success: false,
                message: 'Username already exists',
            });
        }

        if (existingEmail) {
            return res.status(400).send({
                success: false,
                message: 'Email already exists',
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        const user = new UserModel({
            username,
            password: hashedPassword,
            email,
            mobile,
            salutation: salutation || "",
            firstName,
            lastName,
            profile: profile || "",
        });

        // Save the user to the database
        await user.save();

        return res.status(201).send({
            success: true,
            message: 'User created successfully',
            user,
        });

    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



/** POST: http://localhost:8080/api/test/auth/login 
 * @param: {
  "username" : "example123", or
  "email" : "example@example.com",
  "password" : "admin123"
}
*/
export async function login(req, res) {
    try {
        const { username, email, mobile, password } = req.body;

        // Check if username/email/mobile is provided
        if ((!username && !email && !mobile)) {
            return res.status(400).send({
                success: false,
                message: 'Please provide username/email/mobile',
            });
        }

        // Check if the provided password is correct
        if (!password) {
            return res.status(400).send({
                success: false,
                message: 'Please provide password',
            });
        }

        // Find the user by username, email, or mobile
        const user = await UserModel.findOne({
            $or: [{ username }, { email }, { mobile }],
        });

        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'User not found with provided username/email/mobile',
            });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, email: user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with the token
        return res.status(200).send({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
            },
        });

    } catch (error) {
        console.error('Error during user login:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).send({
                success: false,
                message: 'Validation error occurred during login',
                details: error.message,
            });
        }

        if (error.name === 'MongoNetworkError') {
            return res.status(503).send({
                success: false,
                message: 'Service Unavailable. Please try again later.',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({
                success: false,
                message: 'Invalid token. Please log in again.',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                success: false,
                message: 'Session expired. Please log in again.',
            });
        }

        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}


/** PUT: http://localhost:8080/api/auth/googlelogin */
export async function googlelogin(req, res) {
    try {
        // Check if the user already exists
        console.log("Google login request body:", req.body);
        const user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            console.log("User found:", user);
            // Generate token for existing user
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const { password: hashedPassword, ...restItems } = user._doc;
            const expiryDuration = new Date(Date.now() + 3600000); // 1 hour
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDuration })
                .status(200)
                .send({
                    success: true,
                    message: 'Google login successful',
                    user: restItems,
                });
        } else {
            console.log("Creating new user...");
            // Create new user with a random generated password
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10); // added await for hashing
            const newUser = new UserModel({
                username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
                email: req.body.email,
                password: hashedPassword,
                salutation: req.body.salutation || 'Mr',
                firstName: req.body.name.split(" ")[0] || '',
                lastName: req.body.name.split(" ")[1] || "",
                googleId: req.body.id, // Ensure googleId is sent from client
            });

            if (req.body.mobile) {
                newUser.mobile = req.body.mobile;
            }

            await newUser.save();
            // Generate token for new user
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            const { password: hashedPassword2, ...restItems } = newUser._doc;
            const expiryDuration = new Date(Date.now() + 3600000); // 1 hour
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDuration })
                .status(200)
                .send({
                    success: true,
                    message: 'User created successfully',
                    user: restItems,
                });
        }
    } catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



/** GET: http://localhost:8080/api/auth/user/:email */
export async function getUser(req, res) {
    const { email } = req.params;

    try {
        if (!email) {
            return res.status(400).send({
                success: false,
                message: 'Invalid user',
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        // Destructure to remove password before sending response
        const { password, ...restItems } = user.toObject();
        return res.status(200).send({
            success: true,
            message: 'User retrieved successfully',
            user: restItems,
        });
    } catch (error) {
        console.error('Error during user retrieval:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}


/** PUT: http://localhost:8080/api/test/auth/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : '',
    ...
}
*/
export async function updateUser(req, res) {
    try {
        // Extract the userId from the authenticated token
        const { userId } = req.user;
        const updateFields = { ...req.body };

        // Validate if userId exists
        if (!userId) {
            return res.status(400).send({
                success: false,
                message: 'User ID is required',
            });
        }

        // Ensure at least one field to update is provided
        if (!Object.keys(updateFields).length && !req.file) {
            return res.status(400).send({
                success: false,
                message: 'No fields provided for update',
            });
        }

        // Handle profile picture upload if present
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "profile_pictures",
            });
            updateFields.profile = result.secure_url; // Update the profile field with the Cloudinary URL
        }

        // Find and update the user by userId
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true } // Return the updated document and run schema validations
        ).select('-password'); // Exclude password from the returned user object

        // If user not found
        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        // Return success response
        return res.status(200).send({
            success: true,
            message: 'User updated successfully',
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error during user update:', error);

        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).send({
                success: false,
                message: 'Validation error occurred during update',
                details: error.message,
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).send({
                success: false,
                message: 'Invalid user ID format',
            });
        }

        // Generic error response
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



/** GET: http://localhost:8080/api/test/auth/generateOTP */
export async function generateOTP(req, res) {
    try {
        const { email } = req.query;

        // Log request details for debugging
        console.log('Received request for OTP generation with email:', email);

        // Generate a 6-digit OTP with numeric characters only
        const OTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true,
        });

        // Store the OTP in app locals for later verification
        res.app.locals.OTP = OTP;

        // Log the OTP generation process for debugging
        // console.log('OTP generated:', OTP);
        // console.log("Test email:", process.env.MAILGUN_USER);
        // console.log("Test email password:", process.env.MAILGUN_PASSWORD);
        // dxus xxgo hsvt bsrq


        // Send the OTP to the user's email
        const mailResponse = await sendMail({
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${OTP}. It is valid for 5 minutes.`
        });

        if (!mailResponse.success) {
            throw new Error("Failed to send OTP email");
        }

        // Send a success response with the generated OTP
        return res.status(200).send({
            success: true,
            message: 'OTP generated and sent successfully',
            OTP, // Ensure this is removed in production

        });

    } catch (error) {
        // Log the error for debugging
        console.error('Error during OTP generation:', error);

        // Send an internal server error response
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



/** GET: http://localhost:8080/api/test/auth/verifyOTP */
export async function verifyOTP(req, res) {
    try {
        const { OTP } = req.query;

        // Check if OTP exists in the app's local variables
        if (!res.app.locals.OTP) {
            return res.status(400).send({
                success: false,
                message: 'Invalid OTP. Please generate a new OTP.',
            });
        }

        // Compare the provided OTP with the one stored in the app's local variables
        if (parseInt(res.app.locals.OTP) === parseInt(OTP)) {
            // Reset the OTP and start a session for password reset
            req.app.locals.OTP = null;
            req.app.locals.resetSession = true;

            console.log('OTP verified successfully.');

            return res.status(200).send({
                success: true,
                message: 'OTP verified successfully',
            });
        }

        // If OTP does not match, return an error response
        console.log('Invalid OTP provided.');
        return res.status(401).send({
            success: false,
            message: 'Invalid OTP',
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error during OTP verification:', error);

        // Return an internal server error response
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/test/auth/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ success: true, flag: req.app.locals.resetSession });
    }
    return res.status(440).send({ success: false, message: "Session expired!" });
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/test/auth/resetPassword */
export async function resetPassword(req, res) {
    try {
        if (!req.app.locals.resetSession) {
            return res.status(440).send({ success: false, message: "Session expired!" });
        }

        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Find the user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        // Hash the new password
        user.password = await bcrypt.hash(password, 10);

        // Save the updated user
        await user.save();

        // Reset session after successful password update
        req.app.locals.resetSession = false;

        console.log('Password updated successfully for user:', email);

        return res.status(200).send({
            success: true,
            message: "Password updated successfully!",
        });

    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
        });
    }
}



// resend verification email when user didn't receive the email
// /** GET: http://localhost:8080/api/resendVerificationEmail */
// export async function resendVerificationEmail(req,res){
//     res.json('resendVerificationEmail')
// }


// log out the user
/** GET: http://localhost:8080/api/test/auth/logout */
export async function logout(req, res) {
    try {
        // Retrieve the token from the Authorization header or cookies
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            return res.status(400).send({
                success: false,
                message: 'No token provided',
            });
        }

        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict',
        });

        return res.status(200).send({
            success: true,
            message: 'Logged out successfully, token invalidated',
        });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}


// delete the user
/** DELETE: http://localhost:8080/api/test/auth/deleteUser */export async function deleteUser(req, res) {
    try {
        const { userId } = req.user; // Extract userId from the authenticated token

        // Validate if userId exists
        if (!userId) {
            return res.status(400).send({
                success: false,
                message: 'User ID is required',
            });
        }

        // Find and delete the user by userId
        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'User account deleted successfully',
        });

    } catch (error) {
        console.error('Error during user deletion:', error);

        // Handle specific error types
        if (error.name === 'CastError') {
            return res.status(400).send({
                success: false,
                message: 'Invalid user ID format',
            });
        }

        // Generic error response
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}


// forgot password, send email to user with reset link
/** POST: http://localhost:8080/api/test/auth/forgotPassword */
// export async function forgotPassword(req, res) {
//     try {
//         const { email } = req.body;

//         // Validate email
//         if (!email) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Please provide an email address",
//             });
//         }

//         // Check if the user exists with the provided email
//         const user = await UserModel.findOne({ email });
//         if (!user) {
//             return res.status(404).send({
//                 success: false,
//                 message: "User not found with the provided email",
//             });
//         }

//         // Generate OTP
//         const otp = await generateOTP(); // Ensure generateOTP does not send a response itself.

//         // Send OTP to the user's email
//         const mailResponse = await sendMail({
//             to: email,
//             subject: "Password Reset Request",
//             text: `Your OTP for password reset is ${otp}`,
//         });

//         // If sending the email failed, return an error
//         if (!mailResponse.success) {
//             return res.status(500).send({
//                 success: false,
//                 message: "Failed to send OTP. Please try again later.",
//             });
//         }

//         // Return a success response after both OTP generation and email sending succeed
//         return res.status(200).send({
//             success: true,
//             message: "OTP sent successfully to your email",
//             OTP: otp, // Optional: return OTP in response if required for testing.
//         });

//     } catch (error) {
//         console.error('Error during forgotPassword:', error);
//         if (!res.headersSent) {
//             return res.status(500).send({
//                 success: false,
//                 message: "Internal Server Error",
//             });
//         }
//     }
// }

