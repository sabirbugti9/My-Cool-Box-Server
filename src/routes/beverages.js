import { addBeverge, deleteBeverageById, getBeverages, updateBeverageStock } from "../controllers/beverageController.js";
import express from 'express';

import { auth } from "../middleware/auth.js";


const router = express.Router();
router.get('/beverages', auth, getBeverages);


router.post('/beverages', auth, addBeverge);


router.patch('/beverages/:id/stock', auth, updateBeverageStock);


router.delete('/beverages/:id', deleteBeverageById);

export default router;