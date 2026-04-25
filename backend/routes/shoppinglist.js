import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import * as shoppinglistController from '../controllers/shoplistController.js'


router.use(authMiddleware)

router.get("/", shoppinglistController.getShoppingList)

// Static routes MUST come before /:id wildcard routes
router.post("/generate", shoppinglistController.generateFromMealPlan)
router.post("/add-to-pantry", shoppinglistController.addCheckedToPantry)
router.delete("/clear/all", shoppinglistController.clearAll)
router.delete("/clear/checked", shoppinglistController.clearChecked)

// Wildcard routes last
router.post("/", shoppinglistController.addItem)
router.put("/:id/toggle", shoppinglistController.toggleChecked)
router.put("/:id", shoppinglistController.updateItem)
router.delete("/:id", shoppinglistController.deleteItem)

export default router
