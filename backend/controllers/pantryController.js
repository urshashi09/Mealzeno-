import { parse } from "dotenv";
import pantryItem from "../models/pantryItem.js";


export const getPantryItems = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const  {category, is_running_low, search} = req.query

        const items = await pantryItem.findByUserId(userId, { 
            category, 
            is_running_low: is_running_low === 'true' ? true : undefined, 
            search });

        res.status(200).json({ 
            success: true,
            message: 'Pantry items retrieved successfully', 
            data: { items }
        });
    } catch (error) {
        next(error);
    }
}


export const getPantryStat= async (req, res,next) => {
    try {
        const userId = req.user.id;

        const stats= await pantryItem.getStats(userId);

        res.status(200).json({
            success: true,
            message: 'Pantry statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        next(error);
    }   
}


export const getExpiringItems = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const days= parseInt(req.query.days) || 7; // default to 7 days if not provided

        const items = await pantryItem.getExpiringItems(userId, days);

        res.json({
            success: true,
            message: `Pantry items expiring in the next ${days} days retrieved successfully`,
            data: { items }
        });
    } catch (error) {
        next(error);        

    }
}

export const addPantryItem = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const itemData = req.body;

        const newItem = await pantryItem.create(userId, itemData);

        res.status(201).json({
            success: true,
            message: 'Pantry item added successfully',
            data: { item: newItem }
        });
    } catch (error) {
        next(error);
    }
}

export const updatePantryItem = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;
        const itemData = req.body;

        const updatedItem = await pantryItem.update(itemId,userId, itemData);

        res.status(200).json({
            success: true,
            message: 'Pantry item updated successfully',
            data: { item: updatedItem }
        });
    } catch (error) {
        next(error);
    }
}


export const deletePantryItem = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        const item= await pantryItem.delete(itemId, userId);

        if(!item){
            return res.status(404).json({
                success: false,
                message: 'Pantry item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pantry item deleted successfully',
            data: { item }
        });
    } catch (error) {
        next(error);
    }
}
