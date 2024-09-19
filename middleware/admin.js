import jwt from 'jsonwebtoken';
import Admin from '../model/AdminModel.js';

export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded._id, 'sessions.token': token });

        if (!admin) {
            throw new Error('Authentication failed.');
        }

        req.token = token;
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Please authenticate.' });
    }
};

// Super Admin Authorization
export const superAdminMiddleware = (req, res, next) => {
    if (!req.admin.isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied. Super admin only.' });
    }
    next();
};

// Role-based Authorization Middleware
export const limosAdminMiddleware = (req, res, next) => {
    if (req.admin.role !== 'LimosAdmin') {
        return res.status(403).json({ success: false, message: 'Access denied. Limos admin only.' });
    }
    next();
};

export const repairAdminMiddleware = (req, res, next) => {
    if (req.admin.role !== 'RepairAdmin') {
        return res.status(403).json({ success: false, message: 'Access denied. Repair admin only.' });
    }
    next();
};

export const hospitalityAdminMiddleware = (req, res, next) => {
    if (req.admin.role !== 'HospitalityAdmin') {
        return res.status(403).json({ success: false, message: 'Access denied. Hospitality admin only.' });
    }
    next();
};
