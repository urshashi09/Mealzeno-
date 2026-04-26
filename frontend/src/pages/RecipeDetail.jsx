import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const response = await api.get(`/recipe/${id}`);
            const recipeData = response.data.data.recipe;
            setRecipe(recipeData);
            setServings(recipeData.servings || 4);
        } catch (error) {
            console.error('Error fetching recipe:', error);
            navigate('/recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try{
            await api.delete(`/recipe/${id}`); 
            toast.success('Recipe deleted successfully');
            navigate('/recipes');
        } catch (error) {
            console.error('Error deleting recipe:', error);
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

     if(loading){
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

    return (
        <div className="min-h-screen bg-background font-body-md">
            <Navbar />

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 pb-24 md:pb-10">
                {/* Back Button */}
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center group-hover:border-on-surface">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-label-bold">Back to Collection</span>
                </Link>

                {/* Recipe Header */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="font-headline-sm text-4xl text-on-surface font-black tracking-tight leading-tight mb-3">{recipe.name}</h1>
                                {recipe.description && (
                                    <p className="text-body-lg text-on-surface-variant opacity-80 max-w-3xl">{recipe.description}</p>
                                )}
                            </div>
                            <button
                                onClick={handleDelete}
                                className="p-3 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
                                title="Delete recipe"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2.5 mb-8">
                            {recipe.cuisine_type && (
                                <span className="px-4 py-1.5 bg-primary/10 text-on-primary-fixed-variant rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                                    {recipe.cuisine_type}
                                </span>
                            )}
                            {recipe.difficulty && (
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                                    recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-200' :
                                    recipe.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                    {recipe.difficulty}
                                </span>
                            )}
                            {recipe.dietary_tags && recipe.dietary_tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 bg-secondary/10 text-on-secondary-fixed-variant rounded-full text-xs font-black uppercase tracking-widest border border-secondary/10">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-10 py-6 border-t border-surface-container">
                            <div className="flex flex-col">
                                <span className="text-xs font-label-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Total Time</span>
                                <div className="flex items-center gap-2 text-on-surface font-black">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>{totalTime} minutes</span>
                                </div>
                            </div>
                            {recipe.prep_time && (
                                <div className="flex flex-col border-l border-surface-container pl-10">
                                    <span className="text-xs font-label-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Prep Time</span>
                                    <span className="font-black text-on-surface">{recipe.prep_time} min</span>
                                </div>
                            )}
                            {recipe.cook_time && (
                                <div className="flex flex-col border-l border-surface-container pl-10">
                                    <span className="text-xs font-label-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">Cook Time</span>
                                    <span className="font-black text-on-surface">{recipe.cook_time} min</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8 sticky top-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">shopping_basket</span>
                                    <h2 className="font-headline-md text-headline-md text-on-surface">Ingredients</h2>
                                </div>
                            </div>

                            {/* Servings Adjuster */}
                            <div className="mb-10 bg-surface-container-low p-4 rounded-xl border border-surface-container">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Adjust Yield</span>
                                    <span className="font-black text-primary">{servings} Servings</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-outline-variant hover:border-primary hover:text-primary rounded-lg font-black transition-all active:scale-95"
                                    >
                                        −
                                    </button>
                                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-outline-variant">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300" 
                                            style={{ width: `${Math.min(100, (servings / 12) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-outline-variant hover:border-primary hover:text-primary rounded-lg font-black transition-all active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                                {servings !== originalServings && (
                                    <button
                                        onClick={() => setServings(originalServings)}
                                        className="w-full text-center mt-4 text-xs font-label-bold text-primary hover:underline"
                                    >
                                        Reset to original ({originalServings})
                                    </button>
                                )}
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-4">
                                {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
                                    const adjustedQty = adjustQuantity(ingredient.quantity, originalServings);
                                    const isChecked = checkedIngredients.has(index);

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => toggleIngredient(index)}
                                            className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                                isChecked 
                                                    ? 'bg-surface-container border-transparent opacity-60' 
                                                    : 'bg-white border-outline-variant hover:border-primary/30'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                isChecked ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'
                                            }`}>
                                                {isChecked && <Plus className="w-3.5 h-3.5 rotate-45" />}
                                            </div>
                                            <span className={`flex-1 text-body-md ${isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                                <span className="font-black">{adjustedQty}</span> {ingredient.unit} {ingredient.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Cooking Instructions</h2>
                            </div>
                            <div className="space-y-8">
                                {recipe.instructions && recipe.instructions.map((step, index) => (
                                    <div key={index} className="flex gap-6 group">
                                        <div className="shrink-0">
                                            <span className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <p className="text-on-surface text-body-lg leading-relaxed font-body-md">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nutrition Info */}
                        {recipe.nutrition && (
                            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-8">
                                <div className="flex items-center gap-2 mb-8">
                                    <span className="material-symbols-outlined text-secondary">analytics</span>
                                    <h2 className="font-headline-md text-headline-md text-on-surface">Nutritional Information</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fats} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber} unit="g" />
                                </div>
                                <p className="text-xs text-on-surface-variant opacity-50 mt-6 text-center italic">* Values are estimates based on standard serving sizes.</p>
                            </div>
                        )}

                        {/* Cooking Tips */}
                        {recipe.cooking_tips && recipe.cooking_tips.length > 0 && (
                            <div className="bg-primary-fixed text-on-primary-fixed rounded-2xl shadow-sm border border-primary-fixed-dim p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-on-primary-fixed/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-3 relative z-10">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    Cooking tips!
                                </h3>
                                <ul className="space-y-4 relative z-10">
                                    {recipe.cooking_tips.map((tip, index) => (
                                        <li key={index} className="text-body-md leading-relaxed flex gap-4">
                                            <span className="text-primary font-black mt-1">•</span>
                                            <span className="opacity-90">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* User Notes */}
                        {recipe.user_notes && (
                            <div className="bg-tertiary/5 rounded-2xl border border-tertiary/10 p-8">
                                <h3 className="font-headline-sm text-headline-sm text-on-tertiary-fixed-variant mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">edit_note</span>
                                    My Personal Notes
                                </h3>
                                <p className="text-body-md text-on-tertiary-fixed-variant opacity-80 leading-relaxed italic">"{recipe.user_notes}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCard = ({ label, value, unit }) => (
    <div className="text-center p-5 bg-surface-container-low rounded-2xl border border-surface-container hover:border-secondary/30 transition-colors">
        <div className="text-2xl font-black text-on-surface tracking-tighter">{value}{unit}</div>
        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 mt-2">{label}</div>
    </div>
);

export default RecipeDetail;
