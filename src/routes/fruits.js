import { addFruits, deleteFruitsById, getFruits, updateFruitsStock } from "../controllers/fruitsController.js";
import express from 'express';

import { auth } from "../middleware/auth.js";
const router = express.Router();
router.get('/fruits', auth, getFruits);


router.post('/fruits', auth, addFruits);


router.patch('/fruits/:id/stock', auth, addFruits);


router.delete('/fruits/:id', deleteFruitsById);
export default router;