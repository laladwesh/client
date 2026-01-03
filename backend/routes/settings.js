import express from 'express';
import { getDropdownOptions, updateDropdownOptions } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get dropdown options (admin only)
router.get('/dropdown-options', protect, admin, getDropdownOptions);

// Update dropdown options (admin only)
router.put('/dropdown-options', protect, admin, updateDropdownOptions);

export default router;
