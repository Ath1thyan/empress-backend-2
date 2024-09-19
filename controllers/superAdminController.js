import Admin from '../model/AdminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import DeviceDetector from 'device-detector-js';

// Add a new admin (Super Admin only)
export const addAdmin = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (req.admin.isSuperAdmin) {
            if (role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot create another super admin.' });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new Admin({ username, password: hashedPassword, role, isSuperAdmin: false });
            await newAdmin.save();
            res.status(201).json({ success: true, admin: newAdmin });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can add admins.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete an admin (Super Admin only)
export const deleteAdmin = async (req, res) => {
    try {
        if (req.admin.isSuperAdmin) {
            const adminToDelete = await Admin.findById(req.params.id);
            if (!adminToDelete || adminToDelete.role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot delete another super admin.' });
            }

            await Admin.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can delete admins.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change password for a role-based admin (Super Admin only)
export const changeAdminPassword = async (req, res) => {
    try {
        if (req.admin.isSuperAdmin) {
            const { id, newPassword } = req.body;
            const adminToChange = await Admin.findById(id);
            
            if (adminToChange.role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot change password for another super admin.' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Admin.findByIdAndUpdate(id, { password: hashedPassword });
            res.status(200).json({ success: true, message: 'Password updated successfully.' });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can change admin passwords.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// See all login sessions (Super Admin only)
export const viewAllSessions = async (req, res) => {
    try {
        if (!req.admin.isSuperAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied. Only super admins can view sessions.' });
        }

        // Find all admins except super admins and return their username and session details
        const admins = await Admin.find(
            { role: { $ne: 'SuperAdmin' } },
            'username sessions'
        ).lean();

        // Prepare the session data to be sent in the response
        const detailedSessions = admins.map(admin => ({
            username: admin.username,
            sessions: admin.sessions.map(session => ({
                token: session.token,
                createdAt: session.createdAt,
                lastUsedAt: session.lastUsedAt,
                ipAddress: session.ipAddress || 'N/A',
                userAgent: session.userAgent || 'N/A',
                browser: session.browser || 'Unknown',
                os: session.os || 'Unknown',
                device: session.device || 'Unknown',
                location: session.location ? {
                    coordinates: session.location.coordinates || [],
                    city: session.location.city || 'Unknown',
                    region: session.location.region || 'Unknown',
                    country: session.location.country || 'Unknown',
                    zipcode: session.location.zipcode || 'Unknown',
                    timezone: session.location.timezone || 'Unknown'
                } : {},
                deviceType: session.deviceType || 'Unknown',
                deviceBrand: session.deviceBrand || 'Unknown',
                deviceModel: session.deviceModel || 'Unknown',
                deviceScreenSize: session.deviceScreenSize || 'Unknown',
                deviceOperatingSystem: session.deviceOperatingSystem || 'Unknown'
            }))
        }));

        res.status(200).json({ success: true, admins: detailedSessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Logout from a single role-based admin session (Super Admin only)
export const logoutAdminSession = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Admin not authenticated.' });
        }
        const { sessionId } = req.body;
        // Find and remove the session from the admin's sessions
        req.admin.sessions = req.admin.sessions.filter(session => session._id.toString() !== sessionId);
        await req.admin.save();
        res.status(200).json({ success: true, message: 'Session logged out successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Logout from all role-based admin sessions (Super Admin only)
export const logoutAllAdminSessions = async (req, res) => {
    try {
        if (req.admin.isSuperAdmin) {
            const { id } = req.body;
            // Find the admin by ID
            const admin = await Admin.findById(id);
            // Check if admin exists
            if (!admin) {
                return res.status(404).json({ success: false, message: 'Admin not found.' });
            }
            // Check if the admin is a super admin
            if (admin.role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot logout another super admin.' });
            }
            // Clear the sessions
            await Admin.updateOne({ _id: id }, { $set: { sessions: [] } });
            res.status(200).json({ success: true, message: 'All admin sessions logged out successfully.' });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can logout all sessions.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Login Admin
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin by username
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found.' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password.' });
        }

        // Prevent another super admin from accessing this account
        if (admin.isSuperAdmin && req.admin?.isSuperAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied. Cannot login to another Super Admin account.' });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Get IP address, user agent, and location
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        const userAgentString = req.headers['user-agent'] || 'Unknown User-Agent';
        const parsedUserAgent = useragent.parse(userAgentString);
        const location = geoip.lookup(ipAddress);
        const deviceDetector = new DeviceDetector();
        const deviceInfo = deviceDetector.parse(userAgentString);

        // Create session data
        const sessionData = {
            token,
            createdAt: new Date(),
            lastUsedAt: new Date(),
            ipAddress: ipAddress || 'N/A',
            userAgent: userAgentString,
            browser: parsedUserAgent.family || 'Unknown',
            os: parsedUserAgent.os.toString() || 'Unknown',
            device: parsedUserAgent.device.family || 'Unknown',
            location: {
                coordinates: location ? [location.ll[0], location.ll[1]] : [],
                city: location?.city || 'Unknown',
                region: location?.region || 'Unknown',
                country: location?.country || 'Unknown',
                zipcode: location?.zip || 'Unknown',
                timezone: location?.timezone || 'Unknown',
            },
            deviceType: deviceInfo.device?.type || 'Unknown',
            deviceBrand: deviceInfo.device?.brand || 'Unknown',
            deviceModel: deviceInfo.device?.model || 'Unknown',
            deviceScreenSize: 'Unknown', // This typically needs to be captured client-side
            deviceOperatingSystem: parsedUserAgent.os.toString() || 'Unknown',
        };

        // Add token to sessions array in the admin document
        admin.sessions.push(sessionData);
        await admin.save();

        res.status(200).json({ success: true, token, role: admin.role, message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
