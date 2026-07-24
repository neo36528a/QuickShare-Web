import { Router } from 'express';
import { handleSingleUpload, initResumableUpload } from '../controllers/uploadController';
import { getDownloadDetails, verifyDownloadPassword, streamFileContent } from '../controllers/downloadController';
import { getStats, getHealth } from '../controllers/statsController';
import { triggerManualCleanup } from '../controllers/cleanupController';
import { getAdminOverview, deleteFileAdmin } from '../controllers/adminController';
import { apiRateLimiter, uploadRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Apply global rate limiter to all API routes
router.use(apiRateLimiter);

// System Health & Stats
router.get('/health', getHealth);
router.get('/stats', getStats);

// File Upload Routes
router.post('/upload', uploadRateLimiter, handleSingleUpload);
router.post('/upload/resumable-init', uploadRateLimiter, initResumableUpload);

// File Download Routes
router.get('/download/:token', getDownloadDetails);
router.post('/download/:token/verify-password', verifyDownloadPassword);
router.get('/download/:token/file', streamFileContent);

// Cleanup & Admin Routes
router.delete('/cleanup', triggerManualCleanup);
router.get('/admin/overview', getAdminOverview);
router.delete('/admin/files/:id', deleteFileAdmin);

export default router;
