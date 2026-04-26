import db from "../config/db.js";
import pantryItem from "../models/pantryItem.js";
import Recipe from "../models/recipe.js";

import {generateRecipe as generateRecipeAI, generatePantrySuggestions} from "../utils/gemini.js"

export  const generateRecipe= async (req, res,next) => {
    try {
        const userId = req.user.id;
        const{
            ingredients,
            usePantryIngredients=false,
            selectedPantryItems=[],
            dietary_restrictions=[],
            cuisine_type= "any",
            servings= 4,
            cooking_time= "medium"
        }= req.body

        let finalIngredients = Array.isArray(ingredients) ? [...ingredients] : [];

        if(usePantryIngredients){
            const pantryItems = await pantryItem.findByUserId(userId);
            const pantryIngredientNames = pantryItems.map(item => item.name.toLowerCase());
            finalIngredients = [...new Set([...finalIngredients, ...pantryIngredientNames])];
        } else if (Array.isArray(selectedPantryItems) && selectedPantryItems.length > 0) {
            const normalizedSelected = selectedPantryItems.map(name => name.toLowerCase());
            finalIngredients = [...new Set([...finalIngredients, ...normalizedSelected])];
        }

        if(finalIngredients.length === 0){
            return res.status(400).json({
                success: false,
                message: "Please provide at least one ingredient or enable pantry ingredient usage"
            })
        }


        const generatedRecipe = await generateRecipeAI({
            ingredients: finalIngredients,
            dietaryRestrictions: dietary_restrictions,
            cuisineType: cuisine_type,
            servings,
            cookTime: cooking_time
        });

        res.json({
            success: true,
            message: "Recipe generated successfully",
            data: {recipe: generatedRecipe}
        });
    } catch (error) {
        next(error);
    }   
}


export const getPantrySuggestions= async (req, res, next) => {
    try {
        const pantryItems = await pantryItem.findByUserId(req.user.id);
        const expiringItems= await pantryItem.getExpiringItems(req.user.id , 7);

        const expiringNames= expiringItems.map(item => item.name);

        const suggestions = await generatePantrySuggestions(pantryItems, expiringNames);

        res.json({
            success: true,
            message: "Pantry suggestions generated successfully",
            data: {suggestions}
        });
    } catch (error) {
        next(error);
    }   
}



export const saveRecipe = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const savedRecipe = await Recipe.create(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Recipe saved successfully",
            data: {recipe: savedRecipe}
        });
    } catch (error) {
        next(error);
    }   
}


export const getRecipes = async (req, res,next) => {
    try {

        const userId = req.user.id;
        const{
            search,
            cuisine_type,
            difficulty,
            dietary_tags,
            max_cook_time,
            sort_by,
            sort_order,
            limit,
            offset }= req.query

            const recipes= await Recipe.findByUserId(userId, {
                search,
                cuisine_type,
                difficulty,
                dietary_tags,
                max_cook_time: max_cook_time ? parseInt(max_cook_time) : undefined,
                sort_by,
                sort_order,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined
            });

        res.status(200).json({
            success: true,
            message: "Recipes retrieved successfully",
            data: {recipes}
        });
    } catch (error) {
        next(error);
    }
}


export const getRecentRecipes = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        const recipes = await Recipe.getRecent(userId, limit);

        res.status(200).json({
            success: true,
            message: "Recent recipes retrieved successfully",
            data: {recipes}
        });
    }   catch (error) {
        next(error);
    }
}


export const getRecipeById = async (req, res,next) => {
    try {
        const {id}= req.params;
        const foundRecipe = await Recipe.findById(id, req.user.id);
        if(!foundRecipe){
            return res.status(404).json({
                success: false,
                message: "Recipe not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Recipe retrieved successfully",
            data: {recipe: foundRecipe}
        });
    }   catch (error) {
        next(error);
    }
}



export const updateRecipe = async (req, res,next) => {
    try {
        const {id}= req.params;

    const updatedRecipe = await Recipe.update(id, req.user.id, req.body);

        if(!updatedRecipe){
            return res.status(404).json({
                success: false,
                message: "Recipe not found or you do not have permission to update it"
            })
        }

        res.status(200).json({
            success: true,
            message: "Recipe updated successfully",
            data: {recipe: updatedRecipe}
        });
    }   catch (error) {
        next(error);
    }
}


export const deleteRecipe = async (req, res,next) => {
    try {
        const {id}= req.params;

        const deletedRecipe = await Recipe.delete(id, req.user.id);

        if(!deletedRecipe){
            return res.status(404).json({
                success: false,
                message: "Recipe not found or you do not have permission to delete it"
            })
        }

        res.status(200).json({
            success: true,
            message: "Recipe deleted successfully"
        });
    }   catch (error) {
        next(error);
    }
}

export const getStats = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const stats = await Recipe.getStats(userId);

        res.status(200).json({
            success: true,
            message: "Recipe stats retrieved successfully",
            data: {stats}
         });
    } catch (error) {
        next(error);
    }
}
