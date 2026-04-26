import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Plus, X, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_TIMES = [
    { value: 'quick ', label: 'Quick (<30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (>60 min)' }
];

const RecipeGenerator = () => {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [pantryItems, setPantryItems] = useState([]);
    const [selectedPantryItems, setSelectedPantryItems] = useState([]);
    const [showPantryPicker, setShowPantryPicker] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [servings, setServings] = useState(4);
    const [cookingTime, setCookingTime] = useState('medium');
    const [generating, setGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load user preferences and pantry items on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileResponse = await api.get('/user/profile');
                const preferences = profileResponse.data.preferences || profileResponse.data.data?.preferences;
                
                if(preferences){
                    if (Array.isArray(preferences.dietary_restrictions) && preferences.dietary_restrictions.length > 0) {
                        setDietaryRestrictions(preferences.dietary_restrictions);
                    }

                    if (Array.isArray(preferences.preferred_cuisines) && preferences.preferred_cuisines.length > 0) {
                        setCuisineType(preferences.preferred_cuisines[0]);
                    }

                    if (preferences.default_servings) {
                        setServings(preferences.default_servings);
                    }
                }

                // Fetch Pantry
                const pantryResponse = await api.get('/pantry');
                setPantryItems(pantryResponse.data.data.items || []);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchData();
    }, []);

    const addIngredient = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const toggleSelectedPantryItem = (itemName) => {
        if (selectedPantryItems.includes(itemName)) {
            setSelectedPantryItems(selectedPantryItems.filter(i => i !== itemName));
        } else {
            setSelectedPantryItems([...selectedPantryItems, itemName]);
        }
    };

    const toggleDietary = (option) => {
        if (dietaryRestrictions.includes(option)) {
            setDietaryRestrictions(dietaryRestrictions.filter(d => d !== option));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, option]);
        }
    };

    const handleGenerate =async () => {
        if (!usePantry && ingredients.length === 0 && selectedPantryItems.length === 0) {
            toast.error('Please add ingredients or select pantry items');
            return;
        }

        setGenerating(true);
        setGeneratedRecipe(null);

        try{
            const response = await api.post('/recipe/generate', 
                { ingredients,
                    usePantryIngredients: usePantry, 
                    selectedPantryItems: selectedPantryItems,
                    cuisine_type: cuisineType === 'Any' ? 'any' : cuisineType, 
                    dietary_restrictions: dietaryRestrictions, 
                    servings, 
                    cooking_time: cookingTime });

            setGeneratedRecipe(response.data.data.recipe);
            if (response.data.data.recipe?._isFallback) {
                const reason = response.data.data.recipe._fallbackReason;
                const message = reason === 'all_apis_failed' 
                    ? 'Both Gemini and Groq quotas reached. Showing simplified recipe.' 
                    : 'Gemini quota reached — showing simplified recipe.';
                toast(message, { icon: '⚠️' });
            } else {
                toast.success('Recipe generated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error generating recipe');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveRecipe =async () => {
        if (!generatedRecipe) return;

        setSaving(true);
        try{
            await api.post('/recipe', 
                { 
                    name: generatedRecipe.name, 
                    description: generatedRecipe.description, 
                    cuisine_type: generatedRecipe.cuisineType, 
                    difficulty: generatedRecipe.difficulty,
                    prep_time: generatedRecipe.prepTime,
                    cook_time: generatedRecipe.cookTime,
                    servings: generatedRecipe.servings, 
                    instructions: generatedRecipe.instructions,
                    dietary_tags: generatedRecipe.dietaryTags || [],
                    ingredients: generatedRecipe.ingredients, 
                    nutrition: generatedRecipe.nutrition,
                    cooking_tips: generatedRecipe.cookingTips || [],
                 });
            toast.success('Recipe saved successfully!');
        } catch (error) {
            toast.error('Error saving recipe:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background font-body-md text-on-background">
            <Navbar />

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 pb-24 md:pb-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary/10 rounded-2xl mb-6 shadow-sm border border-tertiary/5">
                        <Sparkles className="w-10 h-10 text-tertiary" />
                    </div>
                    <h1 className="font-headline-sm text-4xl text-on-surface font-black tracking-tight">Recipe Generator</h1>
                    <p className="text-body-lg text-on-surface-variant opacity-80 mt-3 max-w-2xl mx-auto">
                        Transform your pantry items into culinary masterpieces with the power of artificial intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Input Section */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-tertiary">inventory_2</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Ingredients</h2>
                            </div>

                            {/* Use Pantry Toggles */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-tertiary/5 rounded-xl border border-tertiary/10 transition-colors hover:bg-tertiary/10">
                                    <input
                                        type="checkbox"
                                        id="use-pantry"
                                        checked={usePantry}
                                        onChange={(e) => {
                                            setUsePantry(e.target.checked);
                                            if (e.target.checked) setShowPantryPicker(false);
                                        }}
                                        className="w-5 h-5 text-tertiary border-outline-variant rounded-md focus:ring-tertiary cursor-pointer"
                                    />
                                    <label htmlFor="use-pantry" className="text-body-md font-medium text-on-tertiary-fixed-variant cursor-pointer select-none">
                                        Use ALL ingredients from my pantry
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPantryPicker(!showPantryPicker);
                                            if (!showPantryPicker) setUsePantry(false);
                                        }}
                                        className={`flex items-center justify-between w-full p-4 rounded-xl text-body-md font-medium transition-all border ${
                                            showPantryPicker 
                                                ? 'bg-tertiary text-white shadow-md border-tertiary' 
                                                : 'bg-white border-outline-variant text-on-surface-variant hover:border-tertiary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Plus className={`w-5 h-5 transition-transform ${showPantryPicker ? 'rotate-45' : ''}`} />
                                            Select specific pantry items
                                        </div>
                                        {selectedPantryItems.length > 0 && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${showPantryPicker ? 'bg-white/20 text-white' : 'bg-tertiary/10 text-tertiary'}`}>
                                                {selectedPantryItems.length} selected
                                            </span>
                                        )}
                                    </button>

                                    {showPantryPicker && (
                                        <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="font-label-bold text-on-surface-variant uppercase tracking-widest mb-4 px-1 opacity-60">Your Pantry Items</div>
                                            {pantryItems.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                                    {pantryItems.map((item) => {
                                                        const isSelected = selectedPantryItems.includes(item.name);
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => toggleSelectedPantryItem(item.name)}
                                                                className={`px-4 py-2.5 rounded-xl text-sm text-left transition-all truncate border ${
                                                                    isSelected
                                                                        ? 'bg-tertiary/10 text-on-tertiary-fixed-variant border-tertiary font-bold shadow-sm'
                                                                        : 'bg-white text-on-surface border-outline-variant hover:border-tertiary hover:bg-tertiary/5'
                                                                }`}
                                                                title={item.name}
                                                            >
                                                                {item.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-body-md text-on-surface-variant opacity-60 mb-3">No items in your pantry.</p>
                                                    <Link to="/pantry" className="text-tertiary font-label-bold hover:underline">Add items now</Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-surface-container my-8"></div>

                            {/* Manual Ingredient Input */}
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                                        placeholder="Add extra ingredient (e.g., tomatoes)"
                                        className="w-full pl-4 pr-10 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all font-body-md"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    className="px-5 py-3.5 bg-tertiary text-white rounded-xl transition-all shadow-sm hover:bg-tertiary/90 active:scale-95 shrink-0"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            {/* All Ingredient Tags */}
                            <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                                {selectedPantryItems.map((item, index) => (
                                    <span
                                        key={`pantry-${index}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary/10 text-on-tertiary-fixed-variant rounded-full text-sm font-bold border border-tertiary/20 shadow-sm animate-in zoom-in-95 duration-200"
                                    >
                                        <div className="w-2 h-2 bg-tertiary rounded-full shadow-[0_0_8px_rgba(0,105,71,0.4)]"></div>
                                        {item}
                                        <button
                                            onClick={() => toggleSelectedPantryItem(item)}
                                            className="hover:text-tertiary transition-colors ml-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                                {ingredients.map((ingredient, index) => (
                                    <span
                                        key={`manual-${index}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-full text-sm font-medium border border-outline-variant shadow-sm animate-in zoom-in-95 duration-200"
                                    >
                                        {ingredient}
                                        <button
                                            onClick={() => removeIngredient(ingredient)}
                                            className="hover:text-error transition-colors ml-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                                {(selectedPantryItems.length === 0 && ingredients.length === 0) && (
                                    <p className="text-label-sm text-on-surface-variant opacity-40 italic">No ingredients added yet...</p>
                                )}
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8 space-y-8">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-secondary">tune</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Preferences</h2>
                            </div>

                            <div >
                                {/* Cuisine Type */}
                                <div className='mb-6'>
                                    <label className="block font-label-bold text-on-surface-variant mb-3 px-1">Cuisine Style</label>
                                    <select
                                        value={cuisineType}
                                        onChange={(e) => setCuisineType(e.target.value)}
                                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md appearance-none cursor-pointer"
                                    >
                                        {CUISINES.map(cuisine => (
                                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cooking Time */}
                                <div>
                                    <label className="block font-label-bold text-on-surface-variant mb-3 px-1">Cooking Time</label>
                                    <div className="flex gap-2">
                                        {COOKING_TIMES.map(time => (
                                            <button
                                                key={time.value}
                                                onClick={() => setCookingTime(time.value)}
                                                className={`flex-1 px-3 py-3 rounded-xl text-sm font-bold transition-all border ${
                                                    cookingTime === time.value
                                                        ? 'bg-secondary text-white border-secondary shadow-sm'
                                                        : 'bg-white border-outline-variant text-on-surface-variant hover:border-secondary hover:bg-secondary/5'
                                                }`}
                                            >
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block font-label-bold text-on-surface-variant mb-3 px-1">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => toggleDietary(option)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                                dietaryRestrictions.includes(option)
                                                    ? 'bg-secondary text-white border-secondary shadow-sm'
                                                    : 'bg-white border-outline-variant text-on-surface-variant hover:border-secondary hover:bg-secondary/5'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Servings */}
                            <div>
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <label className="font-label-bold text-on-surface-variant">Recommended Servings</label>
                                    <span className="text-secondary font-headline-md">{servings} people</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={servings}
                                    onChange={(e) => setServings(parseInt(e.target.value))}
                                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
                                />
                                <div className="flex justify-between text-xs font-label-sm text-on-surface-variant opacity-40 mt-3">
                                    <span>Single</span>
                                    <span>Party size</span>
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full bg-gradient-to-r from-tertiary to-[#00855b] hover:shadow-xl hover:shadow-tertiary/20 text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg tracking-wide active:scale-[0.98]"
                        >
                            {generating ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Brewing Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Generate AI Recipe
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="sticky top-10">
                        {generatedRecipe ? (
                            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(26,26,30,0.1)] border border-surface-container p-8 space-y-8 animate-in slide-in-from-right-10 duration-500 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                
                                {/* Recipe Header */}
                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="font-headline-xl text-3xl text-on-surface font-black tracking-tight leading-tight max-w-[80%]">{generatedRecipe.name}</h2>
                                        <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
                                            <ChefHat className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <p className="text-body-lg text-on-surface-variant leading-relaxed opacity-80">{generatedRecipe.description}</p>

                                    {/* Fallback notice */}
                                    {generatedRecipe._isFallback && (
                                        <div className="flex items-start gap-3 p-4 bg-primary-fixed text-on-primary-fixed rounded-xl border border-primary-fixed-dim text-sm mt-6">
                                            <span className="material-symbols-outlined text-xl">warning</span>
                                            <p className="font-medium">
                                                <strong>AI temporarily unavailable</strong> — this is a simplified recipe. 
                                                {generatedRecipe._fallbackReason === 'all_apis_failed' 
                                                    ? " API quotas reached." 
                                                    : " Gemini quota reached."}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2.5 mt-8">
                                        <span className="px-4 py-1.5 bg-tertiary/10 text-on-tertiary-fixed-variant rounded-full text-xs font-black uppercase tracking-widest border border-tertiary/10">
                                            {generatedRecipe.cuisineType}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                                            generatedRecipe.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-200' :
                                            generatedRecipe.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                            {generatedRecipe.difficulty}
                                        </span>
                                        {generatedRecipe.dietaryTags?.map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-secondary/10 text-on-secondary-fixed-variant rounded-full text-xs font-black uppercase tracking-widest border border-secondary/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-8 mt-8 pb-8 border-b border-surface-container">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-label-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Time</span>
                                            <div className="flex items-center gap-2 text-on-surface font-black">
                                                <Clock className="w-4 h-4 text-tertiary" />
                                                <span>{generatedRecipe.prepTime + generatedRecipe.cookTime} mins</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-label-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Portion</span>
                                            <div className="flex items-center gap-2 text-on-surface font-black">
                                                <Users className="w-4 h-4 text-tertiary" />
                                                <span>{generatedRecipe.servings} servings</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-on-surface mb-5">Required Ingredients</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {generatedRecipe.ingredients?.map((ing, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-surface-container">
                                                <div className="w-2 h-2 bg-tertiary rounded-full"></div>
                                                <span className="text-body-md text-on-surface">
                                                    <span className="font-black">{ing.quantity} {ing.unit}</span> {ing.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-on-surface mb-5">Step-by-Step Guide</h3>
                                    <div className="space-y-4">
                                        {generatedRecipe.instructions?.map((step, index) => (
                                            <div key={index} className="flex gap-4 group">
                                                <span className="shrink-0 w-10 h-10 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center font-black shadow-sm group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
                                                    {index + 1}
                                                </span>
                                                <p className="text-on-surface leading-relaxed pt-2 font-body-md">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Nutrition */}
                                {generatedRecipe.nutrition && (
                                    <div>
                                        <h3 className="font-headline-md text-headline-md text-on-surface mb-5">Nutritional Facts</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                            <NutritionBadge label="Calories" value={generatedRecipe.nutrition.calories} unit="kcal" />
                                            <NutritionBadge label="Protein" value={generatedRecipe.nutrition.protein} unit="g" />
                                            <NutritionBadge label="Carbs" value={generatedRecipe.nutrition.carbs} unit="g" />
                                            <NutritionBadge label="Fats" value={generatedRecipe.nutrition.fats} unit="g" />
                                            <NutritionBadge label="Fiber" value={generatedRecipe.nutrition.fiber} unit="g" />
                                        </div>
                                    </div>
                                )}

                                {/* Cooking Tips */}
                                {generatedRecipe.cookingTips && generatedRecipe.cookingTips.length > 0 && (
                                    <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl p-6 shadow-sm border border-tertiary/10">
                                        <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">lightbulb</span>
                                            Pro Tips
                                        </h3>
                                        <ul className="space-y-3">
                                            {generatedRecipe.cookingTips.map((tip, index) => (
                                                <li key={index} className="text-body-md leading-relaxed flex gap-3">
                                                    <span className="text-tertiary font-black">•</span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-8 border-t border-surface-container">
                                    <button
                                        onClick={handleSaveRecipe}
                                        disabled={saving}
                                        className="flex-1 bg-tertiary hover:bg-tertiary/90 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-95"
                                    >
                                        {saving ? 'Saving...' : 'Save to My Collection'}
                                    </button>
                                    <button
                                        onClick={() => setGeneratedRecipe(null)}
                                        className="px-8 py-4 bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-high font-black transition-all border border-outline-variant active:scale-95"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-surface-container p-16 text-center h-full min-h-[600px] flex flex-col items-center justify-center space-y-6">
                                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-2">
                                    <ChefHat className="w-12 h-12 text-on-surface-variant opacity-30" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-headline-md text-headline-md text-on-surface opacity-40">Ready to cook?</h3>
                                    <p className="text-body-md text-on-surface-variant opacity-40 max-w-[280px]">Your personalized AI-generated recipe will appear here once you're ready.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionBadge = ({ label, value, unit }) => (
    <div className="text-center p-3.5 bg-surface-container-low rounded-xl border border-surface-container">
        <div className="text-xl font-black text-on-surface tracking-tighter">{value}{unit}</div>
        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 mt-1">{label}</div>
    </div>
);

export default RecipeGenerator;
