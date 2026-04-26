import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });



const groq = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY,
}) : null;

if (!process.env.GEMINI_API_KEY) {
    console.error("Warning: GEMINI_API_KEY is not set. Gemini API calls will fail.");
}

if (!process.env.GROQ_API_KEY) {
    console.warn("Warning: GROQ_API_KEY is not set. Groq fallback will not be available.");
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

const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-4-scout",
    "qwen-3-32b",
    "mixtral-8x7b-32768"
];

const callGroqWithFallback = async (params) => {
    let lastError = null;
    for (const modelId of GROQ_MODELS) {
        try {
            console.log(`[Groq] Attempting with model: ${modelId}`);
            const response = await groq.chat.completions.create({
                ...params,
                model: modelId
            });
            return response;
        } catch (error) {
            lastError = error;
            // Fallback if quota reached OR model not found/accessible
            const isModelMissing = error?.status === 404 || error?.code === 'model_not_found' || error?.message?.includes('does not exist');
            if (isQuotaError(error) || isModelMissing) {
                console.warn(`[Groq] ${modelId} failed (${isModelMissing ? 'Not Found' : 'Quota Exceeded'}), trying next model...`);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

const isQuotaError = (error) => {
    // Check numeric status code
    if (error?.status === 429 || error?.code === 429) return true;
    if (error?.status === 413) return true; // Request too large (often happens on free tiers)
    
    // Check string-based status
    if (error?.status === 'RESOURCE_EXHAUSTED') return true;
    if (error?.code === 'rate_limit_exceeded') return true;
    
    // Check message string broadly
    const message = [
        error?.message || '',
        error?.response?.data?.message || '',
        error?.errorDetails ? JSON.stringify(error.errorDetails) : '',
        error?.error?.message || ''
    ].join(' ').toLowerCase();
    
    return (
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('too many requests') ||
        message.includes('resource_exhausted') ||
        message.includes('rate limit') ||
        message.includes('limit_reached')
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



const generateRecipeWithGroq = async (input = {}) => {
    if (!groq) {
        throw new Error("Groq client not initialized");
    }

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
Make sure the recipe is creative, delicious, and makes culinary sense. 
Given the list of pantry ingredients, DO NOT use all ingredients.
Rules:
- Select only relevant ingredients that go well together
- Ignore unrelated items
- Create a realistic dish (not a random mix)
- Prefer 5–8 ingredients maximum
- You MAY add a few additional ingredients if they significantly improve the dish
- Added ingredients should be common (e.g., spices, oil, salt, basic vegetables, herbs)
- Do NOT overload with too many extra ingredients
- Ensure the recipe makes culinary sense`;

    const response = await callGroqWithFallback({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content.trim();
    const jsonText = extractJsonText(generatedText);
    const recipe = JSON.parse(jsonText);
    return recipe;
};

const generatePantrySuggestionsWithGroq = async (pantryItems, expiringItems = []) => {
    if (!groq) {
        throw new Error("Groq client not initialized");
    }

    const safePantryItems = Array.isArray(pantryItems) ? pantryItems : [];
    const safeExpiringItems = Array.isArray(expiringItems) ? expiringItems : [];
    const ingredients = safePantryItems.map(item => item.name).filter(Boolean).join(", ");
    const expiringText = safeExpiringItems.length > 0 ? `The following ingredients are expiring soon: ${safeExpiringItems.join(", ")}. ` : "";

    const prompt = `Based on the following list of pantry ingredients: ${ingredients}. ${expiringText}
    Suggest 3 creative and delicious recipes that can be made using these ingredients. Return only valid JSON (no markdown formatting) in the following format:
    ["Recipe Name 1", "Recipe Name 2", "Recipe Name 3"]

    Each suggestion should be a brief, appetizing name (not a description).`;

    const response = await callGroqWithFallback({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content.trim();
    const suggestions = JSON.parse(extractJsonText(generatedText));
    return suggestions;
};

const generateCookingTipsWithGroq = async (recipe) => {
    if (!groq) {
        throw new Error("Groq client not initialized");
    }

    const safeIngredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
    const prompt = `For this recipe: "${recipe.name}"
    Ingredients: ${safeIngredients.map(ing => ing.name).filter(Boolean).join(", ") || "None"}

    Provide 3-5 helpful cooking tips that can enhance the cooking process or the final dish. These tips can include ingredient substitutions, techniques to improve flavor or texture, and advice on how to best utilize the pantry ingredients.
    Return only valid JSON (no markdown formatting) in the following format:
    ["Tip 1: ...", "Tip 2: ...", "Tip 3: ..."]`;

    const response = await callGroqWithFallback({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content.trim();
    const tips = JSON.parse(extractJsonText(generatedText));
    return tips;
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
Make sure the recipe is creative, delicious, and makes culinary sense. 
Given the list of pantry ingredients, DO NOT use all ingredients.
Rules:
- Select only relevant ingredients that go well together
- Ignore unrelated items
- Create a realistic dish (not a random mix)
- Prefer 5–8 ingredients maximum
- Ensure the recipe makes culinary sense
Avoid using generic filler ingredients that are not in the list. If certain ingredients can be substituted, mention that in the cooking tips.`;

    try {
        const response = await model.generateContent(prompt);
        const generatedText = response.response.text().trim();
        const jsonText = extractJsonText(generatedText);
        const recipe = JSON.parse(jsonText);
        return recipe;
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("[Gemini] Quota exceeded — trying Groq fallback.");
            try {
                if (groq) {
                    const recipe = await generateRecipeWithGroq(input);
                    console.log("[Groq] Successfully generated recipe as fallback.");
                    return recipe;
                } else {
                    console.warn("[Groq] Not available — using hardcoded fallback.");
                }
            } catch (groqError) {
                console.error("[Groq] Fallback failed:", groqError.message);
            }
            return {
                ...buildFallbackRecipe({
                    ingredients: safeIngredients,
                    dietaryRestrictions: safeDietaryRestrictions,
                    cuisineType,
                    servings,
                    cookTime
                }),
                _isFallback: true,
                _fallbackReason: 'all_apis_failed'
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
            console.warn("[Gemini] Quota exceeded — trying Groq fallback.");
            try {
                if (groq) {
                    const suggestions = await generatePantrySuggestionsWithGroq(pantryItems, expiringItems);
                    console.log("[Groq] Successfully generated pantry suggestions as fallback.");
                    return suggestions;
                } else {
                    console.warn("[Groq] Not available — using hardcoded fallback.");
                }
            } catch (groqError) {
                console.error("[Groq] Fallback failed:", groqError.message);
            }
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
            console.warn("[Gemini] Quota exceeded — trying Groq fallback.");
            try {
                if (groq) {
                    const tips = await generateCookingTipsWithGroq(recipe);
                    console.log("[Groq] Successfully generated cooking tips as fallback.");
                    return tips;
                } else {
                    console.warn("[Groq] Not available — using hardcoded fallback.");
                }
            } catch (groqError) {
                console.error("[Groq] Fallback failed:", groqError.message);
            }
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
