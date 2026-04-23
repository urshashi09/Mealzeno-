import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import * as shoppinglistController from '../controllers/shoplistController.js'


router.use(authMiddleware)

router.get("/", shoppinglistController.getShoppingList)
router.post("/generate", shoppinglistController.generateFromMealPlan)
router.post("/", shoppinglistController.addItem)
router.put("/:id", shoppinglistController.updateItem)
router.put(":id/toggle", shoppinglistController.toggleChecked)
router.delete("/:id", shoppinglistController.deleteItem)
router.delete("/clear/all", shoppinglistController.clearAll)
router.delete("/clear/checked", shoppinglistController.clearChecked)
router.post("/add-to-pantry", shoppinglistController.addCheckedToPantry)

export default router