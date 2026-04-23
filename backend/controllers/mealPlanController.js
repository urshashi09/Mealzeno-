import MealPlan from "../models/mealPlan.js";




export const addToMealPlan = async (req, res, next) => {
    try {
        const mealPlan= await MealPlan.create(req.user.id, req.body);


        res.status(201).json({
            success: true,
            message: "Meal added to plan successfully",
            data: {mealPlan}
        });
    }   catch (error) {
        next(error);
    }}


export const getWeeklyMealPlan = async (req, res, next) => {
    try {
        const {start_date, weekStartDate}= req.query;
        const startDate= start_date || weekStartDate || new Date().toISOString().split('T')[0]; // default to current date if not provided

        if(!startDate){
            return res.status(400).json({
                success: false,
                message: "Start date or week start date is required"
            })
        }

        const mealPlan= await MealPlan.getWeeklyPlan(req.user.id, startDate);

        res.status(200).json({
            success: true,
            message: "Weekly meal plan retrieved successfully",
            data: {mealPlan}
        });
    }   catch (error) {
        next(error);
    }}  


    export const getUpcomingMeals = async (req, res, next) => {
        try{
            const limit= parseInt(req.query.limit) || 5;
            const meals= await MealPlan.getUpcoming(req.user.id, limit);

            res.status(200).json({
                success: true,
                message: "Upcoming meals retrieved successfully",
                data: {meals}
            });
        }   catch (error) {
            next(error);
        }}  



    export const deleteMealPlan = async (req, res, next) => {
        try {
            const {id}= req.params;
            const deletedMeal= await MealPlan.delete(id, req.user.id);

            if(!deletedMeal){
                return res.status(404).json({
                    success: false,
                    message: "Meal plan entry not found"
                })
            }

            res.status(200).json({
                success: true,
                message: "Meal plan entry deleted successfully",
                data: {deletedMeal}
            });
        }
        catch (error) {
            next(error);
        }
    }


    export const getMealPlanStats = async (req, res, next) => {
        try {
            const stats= await MealPlan.getStats(req.user.id);

            res.status(200).json({
                success: true,
                message: "Meal plan stats retrieved successfully",
                data: {stats}
            });
        } catch (error) {
            next(error);
        }   
    }
    