import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import { deleteRecipe, generateRecipe, getPantrySuggestions, getRecentRecipes, getRecipeById, getRecipes, getStats, saveRecipe, updateRecipe } from '../controllers/recipeController.js';


router.use(authMiddleware)


//ai generation
router.post("/generate", generateRecipe)
router.post ("/suggestions", getPantrySuggestions)


router.get("/", getRecipes)
router.get("/recents", getRecentRecipes)
router.get("/stats", getStats)
router.get("/:id", getRecipeById)
router.post("/", saveRecipe)
router.put("/:id", updateRecipe)
router.delete("/:id", deleteRecipe)


export default router;





