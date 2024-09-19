import express from 'express';
import {
    addAdmin,
    deleteAdmin,
    changeAdminPassword,
    viewAllSessions,
    logoutAdminSession,
    loginAdmin,
    logoutAllAdminSessions
} from '../controllers/superAdminController.js';
import { adminAuthMiddleware, superAdminMiddleware } from '../middleware/admin.js';

const router = express.Router();

router.post('/add-admin', adminAuthMiddleware, superAdminMiddleware, addAdmin);
router.delete('/delete-admin/:id', adminAuthMiddleware, superAdminMiddleware, deleteAdmin);
router.post('/change-password', adminAuthMiddleware, superAdminMiddleware, changeAdminPassword);
router.get('/view-sessions', adminAuthMiddleware, superAdminMiddleware, viewAllSessions);
router.post('/logout-session', adminAuthMiddleware, superAdminMiddleware, logoutAdminSession);
router.post('/logout-all-sessions', adminAuthMiddleware, superAdminMiddleware, logoutAllAdminSessions);
router.post('/login', loginAdmin);

export default router;
