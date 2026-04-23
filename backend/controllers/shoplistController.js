import shoppingList from "../models/shoppingList.js";



export const generateFromMealPlan = async (req, res, next) => {
    try {
        const {startDate, endDate}= req.body;

        if(!startDate || !endDate){
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            })
        }

        const items= await shoppingList.generateFromMealPlan(req.user.id, startDate, endDate);

        res.status(200).json({
            success: true,
            message: "Shopping list generated successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}



export const getShoppingList = async (req, res, next) => {
    try {
        const grouped= req.query.grouped === 'true';

        const items= grouped ? 
        await shoppingList.getGroupedByCategory(req.user.id) 
        : await shoppingList.findByUserId(req.user.id);


        res.status(200).json({
            success: true,
            message: "Shopping list retrieved successfully",
            data: {items}
        });
    }
        catch (error) { 
        next(error);
    }
}


export const addItem = async (req, res, next) => {
    try {
        const item= await shoppingList.create(req.user.id, req.body);

        res.status(201).json({  
            success: true,
            message: "Item added to shopping list successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const updateItem = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.update(id, req.user.id, req.body);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const toggleChecked = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.toggleChecked(id, req.user.id);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item checked status toggled successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}



export const deleteItem = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.delete(id, req.user.id);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item deleted successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const clearChecked = async (req, res, next) => {
    try {
        const items= await shoppingList.clearChecked(req.user.id);

        res.status(200).json({
            success: true,
            message: "Checked items cleared successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}


export const clearAll = async (req, res, next) => {
    try {
        const items= await shoppingList.clearAll(req.user.id);

        res.status(200).json({
            success: true,
            message: "All items cleared successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}


export const addCheckedToPantry = async (req, res, next) => {
    try {
        const items= await shoppingList.addCheckedItemsToPantry(req.user.id);

        res.status(200).json({
            success: true,
            message: "Checked items added to pantry successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}
