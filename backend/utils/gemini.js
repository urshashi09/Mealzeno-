import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const ai = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
})

if(!process.env.GEMINI_API_KEY) {
    console.error("Warning: GEMINI_API_KEY is not set. Gemini API calls will fail.")
}   

export const generateRecipe = async({ ingredients, dietaryRestrictions= [], cuisineType= "any",servings=4, cookTime='medium' }) => {

    const dietaryInfo = dietaryRestrictions.length > 0 ? 
    `Dietary restrictions: ${dietaryRestrictions.join(", ")}.` :
    "No specific dietary restrictions."


    const timeGuide = {
        "short": "under 30 minutes",
        "medium": "30-60 minutes",
        "long": "over 60 minutes"
    }   

    const prompt = `Generate a recipe based on the following criteria:
- Ingredients: ${ingredients.join(", ")}
- ${dietaryInfo}
- Cuisine type: ${cuisineType}
- Servings: ${servings}
- Cooking time: ${timeGuide[cookTime] || 'any'}

Please provide the recipe in the following JSON format(return only valid JSON, no markdown formatting):

{
    "name": "Recipe Name",
    "description": "A brief description of the recipe.",
    "cuisineType": "${cuisineType}",
    "difficulty": "easy|medium|hard",
    "prepTime": "number (in minutes)",
    "cookTime": "number (in minutes)",
    "servings": ${servings},
    "ingredients": [
        {
            "name": "Ingredient Name",
            "quantity": "number",
            "unit": "unit of measurement (e.g., grams, cups)"
        },
],
    "instructions": [
        "Step 1 instruction.",
        "Step 2 instruction.",
        "... more steps ..."
        ],
    "dietaryTags": ["vegan", "gluten-free", ...],
    "nutrition": {
        "calories": "number",
        "protein": "number (in grams)",
        "carbs": "number (in grams)",
        "fats": "number (in grams)",
        "fiber": "number (in grams)"
    },
    "cookingTips": [
        "Tip 1: ...",
        "Tip 2: ..."
    ],
}
    Make sure the recipe is creative, delicious and uses the provided ingredients as much as possible. Avoid using generic filler ingredients that are not in the list. If certain ingredients can be substituted, mention that in the cooking tips.`

    try {
        const response = await ai.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        })

        const generatedText = response.text.trim();
        
        
        let jsonText = generatedText;
        if(generatedText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "")
            
        }else if(generatedText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "")
        }

        
        const recipe = JSON.parse(jsonText);
        return recipe;
    } catch (error) {
        console.error("Error generating recipe:", error);
        throw new Error("Failed to generate recipe. Please try again.");
    }
}


export const generatePantrySuggestions = async (pantryItems, expiringItems=[]) => {
    const ingredients= pantryItems.map(item => item.name).join(", ");
    const expiringText = expiringItems.length > 0 ? `The following ingredients are expiring soon: ${expiringItems.join(", ")}. ` : "";


    const prompt= `Based on the following list of pantry ingredients: ${ingredients}. ${expiringText} 
    Suggest 3 creative and delicious recipes that can be made using these ingredients. Return only valid JSON (no markdown formatting) in the following format:
    ["Recipe Name 1", "Recipe Name 2", "Recipe Name 3"]

    Each suggestion should bne brief, appetizing description (1-2 sentences) of the recipe, highlighting how it uses the pantry ingredients. Focus on recipes that utilize the expiring items if possible. Avoid suggesting recipes that require many additional ingredients not listed in the pantry.`

    try {
        const response = await ai.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        })

        const generatedText = response.text.trim();

        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
            
        } else if (generatedText.startsWith("```")) {
            generatedText = generatedText.replace(/```\n?/g, "");
        }

        const suggestions = JSON.parse(generatedText);
        return suggestions;
    } catch (error) {
        console.error("Error generating pantry suggestions:", error);
        throw new Error("Failed to generate pantry suggestions. Please try again.");
    }
}



export const generateCookingTips = async (recipe) => {
    const prompt= `For this recipe: "${recipe.name}"
    Ingredients: ${recipe.ingredients.map(ing => ing.name).join(", ") || "None"}
    
    provide 3-5 helpful cooking tips that can enhance the cooking process or the final dish. These tips can include ingredient substitutions, techniques to improve flavor or texture, and advice on how to best utilize the pantry ingredients. 
    Return only valid JSON (no markdown formatting) in the following format:
    ["Tip 1: ...", "Tip 2: ...", "Tip 3: ..."]`

    try {
        const response = await ai.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        })  
        const generatedText = response.text.trim();

        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
            
        } else if (generatedText.startsWith("```")) {
            generatedText = generatedText.replace(/```\n?/g, "");
        }

        const tips = JSON.parse(generatedText);
        return tips;
    } catch (error) {
        console.error("Error generating cooking tips:", error);
        throw new Error("Failed to generate cooking tips. Please try again.");
    }
}


export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
}