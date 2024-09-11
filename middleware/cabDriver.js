import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

/** Load environment variables */
dotenv.config();

export default function CabDriverAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header: ', authHeader)

        // Check if the authorization header is present
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header is missing',
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token: ', token)

        // Check if the token is present
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user information to the request
        req.driverId = decoded.driverId;
        console.log('driverId: ', decoded.driverId)
        next();
    } catch (error) {
        console.error('Error in token verification:', error);

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        // Generic error response
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}
