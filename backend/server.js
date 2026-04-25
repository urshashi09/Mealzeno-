import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import pantryRoutes from "./routes/pantry.js"
import recipeRoutes from "./routes/recipe.js"
import mealPlanRoutes from "./routes/mealplan.js"
import shoppingListRoutes from "./routes/shoppinglist.js";

dotenv.config()


import express from "express";
import cors from "cors"

const app=express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (req,res)=>{
    res.json({message: "ai recipe generator app"})
})

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/pantry", pantryRoutes)
app.use("/api/recipe", recipeRoutes)
app.use("/api/mealplan", mealPlanRoutes)
app.use("/api/shoppinglist", shoppingListRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || "Internal Server Error" });
});


app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})