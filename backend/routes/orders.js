import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  updateOrderStage,
  addDelhiveryWaybill,
  trackOrder,
  createDelhiveryShipment,
  cancelDelhiveryShipment
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/track', protect, trackOrder);

// admin
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/stage', protect, admin, updateOrderStage);
router.put('/:id/delhivery/waybill', protect, admin, addDelhiveryWaybill);
router.post('/:id/delhivery/shipment', protect, admin, createDelhiveryShipment);
router.delete('/:id/delhivery/cancel', protect, admin, cancelDelhiveryShipment);

export default router;
