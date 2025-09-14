// routes/orders.js
import express from 'express';
import { createOrder, getUserOrders, refundOrder, getPaymentHistory } from '../controllers/orderController.js';
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post('/orders', auth, createOrder);
router.get('/users/:userId/orders', auth, getUserOrders);
router.get('/users/:userId/payments', auth, getPaymentHistory);
router.post('/refund/:orderId', auth, refundOrder);

export default router;