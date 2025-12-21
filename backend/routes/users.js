import express from 'express';
import { getUsers, updateUser, deleteUser, getMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

// user address endpoints (authenticated)
router.get('/me/addresses', protect, getMyAddresses);
router.post('/me/addresses', protect, addMyAddress);
router.put('/me/addresses/:addressId', protect, updateMyAddress);
router.delete('/me/addresses/:addressId', protect, deleteMyAddress);

export default router;
