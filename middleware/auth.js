import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

/** Load environment variables */
dotenv.config();

/** Middleware for verifying JWT token */
export default async function Auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Check if the authorization header is present
        if (!authHeader) {
            return res.status(401).send({
                success: false,
                message: 'Authorization header is missing',
            });
        }

        const token = authHeader.split(' ')[1];

        // Check if the token is present
        if (!token) {
            return res.status(401).send({
                success: false,
                message: 'No token provided',
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user information to the request
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Error in token verification:', error);

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                success: false,
                message: 'Token has expired',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({
                success: false,
                message: 'Invalid token',
            });
        }

        // Generic error response
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}



export function localVariables(req, res, next) {
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next();
}
