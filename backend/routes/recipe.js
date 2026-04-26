import express from 'express';

const router = express.Router();

import authMiddleware from '../middleware/auth.js';
import { deleteRecipe, generateRecipe, getPantrySuggestions, getRecentRecipes, getRecipeById, getRecipes, getStats, saveRecipe, updateRecipe } from '../controllers/recipeController.js';


router.use(authMiddleware)


import rateLimit from "express-rate-limit";

const recipeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each user to 5 requests per minute
  message: {
    status: 'error',
    message: "Too many recipe requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//ai generation
router.post("/generate", recipeLimiter, generateRecipe)
router.post("/suggestions", getPantrySuggestions)


router.get("/", getRecipes)
router.get("/recents", getRecentRecipes)
router.get("/stats", getStats)
router.get("/:id", getRecipeById)
router.post("/", saveRecipe)
router.put("/:id", updateRecipe)
router.delete("/:id", deleteRecipe)


export default router;





