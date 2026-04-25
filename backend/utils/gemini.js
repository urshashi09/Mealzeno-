import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

if (!process.env.GEMINI_API_KEY) {
    console.error("Warning: GEMINI_API_KEY is not set. Gemini API calls will fail.");
}

const extractJsonText = (text) => {
    const trimmed = text.trim();

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch) {
        return fencedMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }

    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return trimmed.slice(firstBracket, lastBracket + 1);
    }

    return trimmed;
};

const isQuotaError = (error) => {
    // Check numeric status code (Google AI SDK sets error.status)
    if (error?.status === 429 || error?.code === 429) return true;
    // Check string-based status
    if (error?.status === 'RESOURCE_EXHAUSTED') return true;
    // Check message string broadly
    const message = [
        error?.message || '',
        error?.response?.data?.message || '',
        error?.errorDetails ? JSON.stringify(error.errorDetails) : ''
    ].join(' ').toLowerCase();
    return (
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('too many requests') ||
        message.includes('resource_exhausted') ||
        message.includes('rate limit')
    );
};

const buildFallbackRecipe = ({ ingredients, dietaryRestrictions, cuisineType, servings, cookTime }) => {
    const mainIngredients = ingredients.length > 0 ? ingredients.slice(0, 4) : ['pantry staples'];
    const titleSource = mainIngredients
        .map((item) => item.split(' ')[0])
        .filter(Boolean)
        .slice(0, 3)
        .join(' ')
        .trim();

    const name = titleSource
        ? `${titleSource.charAt(0).toUpperCase()}${titleSource.slice(1)} ${cuisineType && cuisineType !== 'any' ? cuisineType : 'Kitchen'} Bowl`
        : 'Simple Pantry Bowl';

    return {
        name,
        description: `A simple ${cuisineType !== 'any' ? cuisineType : 'home-style'} recipe built from the ingredients you provided.`,
        cuisineType: cuisineType || 'any',
        difficulty: 'easy',
        prepTime: cookTime === 'long' ? 20 : 10,
        cookTime: cookTime === 'long' ? 35 : cookTime === 'medium' ? 20 : 12,
        servings,
        ingredients: mainIngredients.map((ingredient, index) => ({
            name: ingredient,
            quantity: index === 0 ? 2 : 1,
            unit: 'pieces'
        })),
        instructions: [
            'Prepare all ingredients and have them ready to use.',
            'Heat a pan with a little oil over medium heat.',
            'Cook the ingredients until warmed through and lightly browned.',
            'Season to taste and serve hot.'
        ],
        dietaryTags: dietaryRestrictions.filter(Boolean),
        nutrition: {
            calories: 350,
            protein: 14,
            carbs: 30,
            fats: 16,
            fiber: 5
        },
        cookingTips: [
            'Use whatever vegetables or protein you have on hand.',
            'Add a splash of water or stock if the pan gets too dry.',
            'Finish with herbs, lemon, or chili flakes for extra flavor.'
        ]
    };
};

export const generateRecipe = async (input = {}) => {
    const ingredients = Array.isArray(input.ingredients) ? input.ingredients : Array.isArray(input.finalIngredients) ? input.finalIngredients : [];
    const dietaryRestrictions = Array.isArray(input.dietaryRestrictions)
        ? input.dietaryRestrictions
        : Array.isArray(input.dietary_restrictions)
            ? input.dietary_restrictions
            : [];
    const cuisineType = input.cuisineType ?? input.cuisine_type ?? 'any';
    const servings = input.servings ?? 4;
    const cookTime = input.cookTime ?? input.cooking_time ?? 'medium';

    const safeIngredients = ingredients.filter(Boolean);
    const safeDietaryRestrictions = dietaryRestrictions.filter(Boolean);

    const dietaryInfo = safeDietaryRestrictions.length > 0 ?
        `Dietary restrictions: ${safeDietaryRestrictions.join(", ")}.` :
        "No specific dietary restrictions.";

    const timeGuide = {
        "short": "under 30 minutes",
        "medium": "30-60 minutes",
        "long": "over 60 minutes"
    };

    const prompt = `Generate a recipe based on the following criteria:
- Ingredients: ${safeIngredients.join(", ")}
- ${dietaryInfo}
- Cuisine type: ${cuisineType}
- Servings: ${servings}
- Cooking time: ${timeGuide[cookTime] || 'any'}

Please provide the recipe in the following JSON format (return only valid JSON, no markdown formatting):

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
        }
    ],
    "instructions": [
        "Step 1 instruction.",
        "Step 2 instruction.",
        "... more steps ..."
    ],
    "dietaryTags": ["vegan", "gluten-free"],
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
    ]
}
Make sure the recipe is creative, delicious and uses the provided ingredients as much as possible. Avoid using generic filler ingredients that are not in the list. If certain ingredients can be substituted, mention that in the cooking tips.`;

    try {
        const response = await model.generateContent(prompt);
        const generatedText = response.response.text().trim();
        const jsonText = extractJsonText(generatedText);
        const recipe = JSON.parse(jsonText);
        return recipe;
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("[Gemini] Quota exceeded — returning fallback recipe.");
            return {
                ...buildFallbackRecipe({
                    ingredients: safeIngredients,
                    dietaryRestrictions: safeDietaryRestrictions,
                    cuisineType,
                    servings,
                    cookTime
                }),
                _isFallback: true
            };
        }
        console.error("Error generating recipe:", error);
        throw new Error(`Failed to generate recipe. Please try again. ${error.message ? `(${error.message})` : ''}`);
    }
};


export const generatePantrySuggestions = async (pantryItems, expiringItems = []) => {
    const safePantryItems = Array.isArray(pantryItems) ? pantryItems : [];
    const safeExpiringItems = Array.isArray(expiringItems) ? expiringItems : [];
    const ingredients = safePantryItems.map(item => item.name).filter(Boolean).join(", ");
    const expiringText = safeExpiringItems.length > 0 ? `The following ingredients are expiring soon: ${safeExpiringItems.join(", ")}. ` : "";

    const prompt = `Based on the following list of pantry ingredients: ${ingredients}. ${expiringText}
    Suggest 3 creative and delicious recipes that can be made using these ingredients. Return only valid JSON (no markdown formatting) in the following format:
    ["Recipe Name 1", "Recipe Name 2", "Recipe Name 3"]

    Each suggestion should be a brief, appetizing name (not a description). Focus on recipes that utilize the expiring items if possible. Avoid suggesting recipes that require many additional ingredients not listed in the pantry.`;

    try {
        const response = await model.generateContent(prompt);
        const generatedText = extractJsonText(response.response.text());
        const suggestions = JSON.parse(generatedText);
        return suggestions;
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("[Gemini] Quota exceeded — returning fallback pantry suggestions.");
            return [
                'Pantry Pasta Toss',
                'Vegetable Stir-Fry Bowl',
                'Creamy Grain Salad'
            ];
        }
        console.error("Error generating pantry suggestions:", error);
        throw new Error(`Failed to generate pantry suggestions. Please try again. ${error.message ? `(${error.message})` : ''}`);
    }
};


export const generateCookingTips = async (recipe) => {
    const safeIngredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
    const prompt = `For this recipe: "${recipe.name}"
    Ingredients: ${safeIngredients.map(ing => ing.name).filter(Boolean).join(", ") || "None"}

    Provide 3-5 helpful cooking tips that can enhance the cooking process or the final dish. These tips can include ingredient substitutions, techniques to improve flavor or texture, and advice on how to best utilize the pantry ingredients.
    Return only valid JSON (no markdown formatting) in the following format:
    ["Tip 1: ...", "Tip 2: ...", "Tip 3: ..."]`;

    try {
        const response = await model.generateContent(prompt);
        const generatedText = extractJsonText(response.response.text());
        const tips = JSON.parse(generatedText);
        return tips;
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("[Gemini] Quota exceeded — returning fallback cooking tips.");
            return [
                'Prep everything before you start cooking.',
                'Taste and adjust seasoning near the end.',
                'Let the finished dish rest for a minute before serving.'
            ];
        }
        console.error("Error generating cooking tips:", error);
        throw new Error(`Failed to generate cooking tips. Please try again. ${error.message ? `(${error.message})` : ''}`);
    }
};


export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
};
