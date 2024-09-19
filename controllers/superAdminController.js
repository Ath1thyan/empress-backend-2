import Admin from '../model/AdminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
        if (req.admin.isSuperAdmin) {
            const admins = await Admin.find({ role: { $ne: 'SuperAdmin' } }, 'username sessions');
            res.status(200).json({ success: true, admins });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can view sessions.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Logout from a single role-based admin session (Super Admin only)
export const logoutAdminSession = async (req, res) => {
    try {
        if (req.admin.isSuperAdmin) {
            const { id, sessionToken } = req.body;
            const admin = await Admin.findById(id);
            
            if (admin.role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot logout another super admin.' });
            }

            await Admin.updateOne({ _id: id }, { $pull: { sessions: { token: sessionToken } } });
            res.status(200).json({ success: true, message: 'Admin session logged out successfully.' });
        } else {
            res.status(403).json({ success: false, message: 'Access denied. Only super admins can logout sessions.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Logout from all role-based admin sessions (Super Admin only)
export const logoutAllAdminSessions = async (req, res) => {
    try {
        if (req.admin.isSuperAdmin) {
            const { id } = req.body;
            const admin = await Admin.findById(id);

            if (admin.role === 'SuperAdmin') {
                return res.status(403).json({ success: false, message: 'Cannot logout another super admin.' });
            }

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

        // Add token to sessions array in the admin document
        admin.sessions.push({ token });
        await admin.save();

        res.status(200).json({ success: true, token, role: admin.role, message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
