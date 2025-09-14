
import express from 'express';
import { createCoupon, deleteCoupon, getCoupons, updateCoupon, addDummyCoupons } from '../controllers/coupon_controller.js';
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post('/coupon', auth, createCoupon);
router.get('/coupon', getCoupons);

router.put('/update-coupon', auth, updateCoupon);
router.delete('/delete-coupon', auth, deleteCoupon);
router.post('/add-dummy-coupons', addDummyCoupons);

export default router;