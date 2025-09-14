import { addAccessories, deleteAccessoriesById, getAccessories, updateAccessoriesStock } from "../controllers/accessoriesController.js";
import express from 'express';

import { auth } from "../middleware/auth.js";

const router = express.Router();
router.get('/accessories', auth, getAccessories);


router.post('/accessories', auth, addAccessories);


router.patch('/accessories/:id/stock', auth, updateAccessoriesStock);


router.delete('/accessories/:id', deleteAccessoriesById);

export default router;