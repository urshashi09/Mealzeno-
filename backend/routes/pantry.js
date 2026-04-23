import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import { addPantryItem, deletePantryItem, getExpiringItems, getPantryItems, getPantryStat, updatePantryItem } from '../controllers/pantryController.js';

router.use(authMiddleware);


router.get("/", getPantryItems)
router.get("/stats",getPantryStat)
router.get("/expiring-soon", getExpiringItems)
router.post("/", addPantryItem)
router.put("/:id", updatePantryItem)
router.delete("/:id", deletePantryItem)

export default router;