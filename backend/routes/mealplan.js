import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import * as mealplanController from '../controllers/mealplanController.js'

router.use(authMiddleware)

router.get("/weekly", mealplanController.getWeeklyMealPlan)
router.get("/upcoming", mealplanController.getUpcomingMeals)
router.get("/stats", mealplanController.getMealPlanStats)
router.post("/", mealplanController.addToMealPlan)
router.delete("/:id", mealplanController.deleteMealPlan)

export default router