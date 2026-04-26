import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChefHat, Calendar, ChevronLeft, ChevronRight, Sparkles, Trash2, Search } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import api from '../services/api';


const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MealPlanner = () => {
    const [searchParams] = useSearchParams();
    const [weekStart, setWeekStart] = useState(() => {
        const weekStartParam = searchParams.get('weekStart');
        if (weekStartParam) {
            const parsedDate = new Date(weekStartParam);
            if (!Number.isNaN(parsedDate.getTime())) {
                return startOfWeek(parsedDate);
            }
        }
        return startOfWeek(new Date());
    });
    const [mealPlan, setMealPlan] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removingMealId, setRemovingMealId] = useState(null);

    const fetchMealPlan = useCallback(async () => {
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

            const response = await api.get(`/mealplan/weekly?start_date=${startDate}&end_date=${endDate}`);
            const meals = response.data.data.mealPlan || [];

            const organized = {};
            meals.forEach(meal => {
                const dateKey = format(new Date(meal.meal_date), 'yyyy-MM-dd');
                if (!organized[dateKey]) organized[dateKey] = {};
                organized[dateKey][meal.meal_type] = meal;
            });
            setMealPlan(organized);
        } catch (error) {
            console.error('Error fetching meal plan:', error);
            toast.error('Error fetching meal plan');
        } finally {
            setLoading(false);
        }
    }, [weekStart]);


    const fetchRecipes = useCallback(async () => {
        try {
            const response = await api.get('/recipe');
            setRecipes(response.data.data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } 
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchMealPlan();
        fetchRecipes();
    }, [fetchMealPlan, fetchRecipes]);

    useEffect(() => {
        const weekStartParam = searchParams.get('weekStart');
        if (!weekStartParam) return;

        const parsedDate = new Date(weekStartParam);
        if (!Number.isNaN(parsedDate.getTime())) {
            setWeekStart(startOfWeek(parsedDate));
        }
    }, [searchParams]);

    const handleAddMeal = (date, mealType) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleRemoveMeal = async(mealId) => {
        if (!confirm('Remove this meal from your plan?')) return;

        setRemovingMealId(mealId);
        try{
            await api.delete(`/mealplan/${mealId}`); 
            await fetchMealPlan();
            toast.success('Meal removed successfully');
            
        } catch (error) {
            console.error('Error removing meal:', error);
            toast.error('Error removing meal');
        } finally {
            setRemovingMealId(null);
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    const navigateWeek = (days) => {
        setWeekStart(addDays(weekStart, days));
    };

    const resetToToday = () => {
        setWeekStart(startOfWeek(new Date()));
    };

    return (
        <div className="min-h-screen bg-background font-body-md text-on-background">
            <Navbar />

            <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 pb-24 md:pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h1 className="font-headline-xl text-headline-xl font-black tracking-tight leading-none">Meal Planner</h1>
                        </div>
                        <p className="text-body-lg text-on-surface-variant opacity-80">Organize your weekly culinary journey and stay on track.</p>
                    </div>

                    {/* Week Navigation - Stitch UI Style */}
                    <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-surface-container">
                        <button
                            onClick={() => navigateWeek(-7)}
                            className="p-3 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-xl transition-all"
                            title="Previous Week"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="px-6 py-2 flex flex-col items-center min-w-[240px]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">
                                {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}
                            </span>
                            <span className="font-headline-md text-sm font-bold text-on-surface">
                                {format(weekStart, 'MMMM yyyy')}
                            </span>
                        </div>

                        <button
                            onClick={() => navigateWeek(7)}
                            className="p-3 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-xl transition-all"
                            title="Next Week"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={resetToToday}
                        className="px-6 py-3 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full font-label-bold hover:bg-tertiary/20 transition-all active:scale-95"
                    >
                        Current Week
                    </button>
                </div>

                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center bg-white rounded-3xl border border-surface-container shadow-sm">
                        <div className="w-10 h-10 border-4 border-tertiary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Calendar Grid */}
                        <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgba(26,26,30,0.06)] border border-surface-container overflow-hidden">
                            {/* Desktop Grid Layout */}
                            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                                <div className="min-w-[1000px]">
                                    {/* Days Header */}
                                    <div className="grid grid-cols-[120px_repeat(7,1fr)] bg-surface-container-low border-b border-surface-container">
                                        <div className="p-6 border-r border-surface-container bg-surface-container-low flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Meal</span>
                                        </div>
                                        {DAYS_OF_WEEK.map((day, index) => {
                                            const date = addDays(weekStart, index);
                                            const isTodayDate = isToday(date);
                                            return (
                                                <div 
                                                    key={day} 
                                                    className={`p-6 text-center border-r border-surface-container last:border-r-0 transition-colors ${isTodayDate ? 'bg-tertiary/5' : ''}`}
                                                >
                                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isTodayDate ? 'text-tertiary' : 'text-on-surface-variant opacity-40'}`}>
                                                        {day.slice(0, 3)}
                                                    </div>
                                                    <div className={`text-xl font-black ${isTodayDate ? 'text-tertiary scale-110' : 'text-on-surface'}`}>
                                                        {format(date, 'd')}
                                                    </div>
                                                    {isTodayDate && <div className="w-1.5 h-1.5 bg-tertiary rounded-full mx-auto mt-2 shadow-[0_0_8px_rgba(0,105,71,0.5)]"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Meal Rows */}
                                    {MEAL_TYPES.map(mealType => (
                                        <div key={mealType} className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-surface-container last:border-b-0">
                                            <div className="p-6 border-r border-surface-container bg-surface-container-low/50 flex items-center justify-center">
                                                <span className="font-label-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                                                    {mealType}
                                                </span>
                                            </div>
                                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                                const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                                const dayMeals = getDayMeals(dayIndex);
                                                const meal = dayMeals[mealType];

                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`p-4 border-r border-surface-container last:border-r-0 min-h-[160px] relative transition-all group/cell hover:bg-surface-container-low/30`}
                                                    >
                                                        {meal ? (
                                                            <div className="relative h-full group animate-in fade-in duration-300">
                                                                <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl p-4 h-full shadow-sm border border-tertiary/10 group-hover:shadow-md transition-all flex flex-col justify-between">
                                                                    <div className="mb-2">
                                                                        <p
                                                                            className="text-xs font-black leading-tight break-words line-clamp-3 mb-1"
                                                                            title={meal.recipe_name}
                                                                        >
                                                                            {meal.recipe_name}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center justify-between mt-auto">
                                                                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                                                            <ChefHat className="w-3 h-3" />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleRemoveMeal(meal.id)}
                                                                            disabled={removingMealId === meal.id}
                                                                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-all text-on-tertiary-fixed opacity-0 group-hover:opacity-100 disabled:opacity-100"
                                                                        >
                                                                            {removingMealId === meal.id
                                                                                ? <div className="w-3 h-3 border-2 border-on-tertiary-fixed border-t-transparent rounded-full animate-spin" />
                                                                                : <Trash2 className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddMeal(date, mealType)}
                                                                className="w-full h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant opacity-10 hover:opacity-100 hover:text-tertiary hover:bg-tertiary/5 rounded-2xl transition-all border-2 border-dashed border-transparent hover:border-tertiary/20 group"
                                                            >
                                                                <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center transition-transform group-hover:scale-110">
                                                                    <Plus className="w-6 h-6" />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Plan Meal</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile View (Stacked List) */}
                            <div className="lg:hidden divide-y divide-surface-container">
                                {DAYS_OF_WEEK.map((day, dayIndex) => {
                                    const date = addDays(weekStart, dayIndex);
                                    const dateKey = format(date, 'yyyy-MM-dd');
                                    const dayMeals = getDayMeals(dayIndex);
                                    const isTodayDate = isToday(date);

                                    return (
                                        <div key={day} className={`p-6 ${isTodayDate ? 'bg-tertiary/5' : ''}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${isTodayDate ? 'bg-tertiary text-white border-tertiary' : 'bg-surface-container-low border-surface-container'}`}>
                                                        <span className="text-[10px] font-black uppercase">{day.slice(0, 3)}</span>
                                                        <span className="text-xl font-black leading-none">{format(date, 'd')}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`font-headline-md text-sm font-bold ${isTodayDate ? 'text-tertiary' : 'text-on-surface'}`}>
                                                            {isTodayDate ? 'Today' : day}
                                                        </p>
                                                        <p className="text-xs text-on-surface-variant opacity-60">{format(date, 'MMMM yyyy')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {MEAL_TYPES.map(mealType => {
                                                    const meal = dayMeals[mealType];
                                                    return (
                                                        <div key={mealType} className="flex items-center gap-4">
                                                            <div className="w-20 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                                                                {mealType}
                                                            </div>
                                                            {meal ? (
                                                                <div className="flex-1 bg-tertiary-fixed text-on-tertiary-fixed p-3 rounded-xl flex items-center justify-between shadow-sm border border-tertiary/10">
                                                                    <span className="text-xs font-bold line-clamp-1">{meal.recipe_name}</span>
                                                                    <button
                                                                        onClick={() => handleRemoveMeal(meal.id)}
                                                                        className="p-1.5 bg-white/20 rounded-lg"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAddMeal(dateKey, mealType)}
                                                                    className="flex-1 py-3 px-4 border border-outline-variant rounded-xl text-xs font-label-bold text-on-surface-variant opacity-40 hover:opacity-100 hover:border-tertiary hover:text-tertiary transition-all text-left flex items-center gap-2"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    Add meal
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Stats - Premium Style */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container flex items-center gap-6 group hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <ChefHat className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">Recipes Available</p>
                                    <p className="text-3xl font-black text-on-surface">{recipes.length}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container flex items-center gap-6 group hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">Meals Planned</p>
                                    <p className="text-3xl font-black text-on-surface">
                                        {Object.values(mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container flex flex-col justify-center gap-2 group hover:shadow-lg transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">Current Focus</p>
                                <p className="text-xl font-bold text-on-surface">Weekly Balance</p>
                                <Link to="/pantry" className="text-xs font-black text-secondary hover:underline flex items-center gap-1 mt-1">
                                    Check Ingredients <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Meal Modal - Updated Design */}
            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                    onSuccess={(newMeal) => {
                        const updatedPlan = { ...mealPlan };
                        const date = selectedSlot.date;
                        if (!updatedPlan[date]) {
                            updatedPlan[date] = {};
                        }
                        updatedPlan[date][selectedSlot.mealType] = newMeal;
                        setMealPlan(updatedPlan);
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [customMealName, setCustomMealName] = useState('');
    const [mode, setMode] = useState('recipe'); // 'recipe' or 'custom'
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (mode === 'recipe' && !selectedRecipe) {
            toast.error('Please select a recipe');
            return;
        }
        
        if (mode === 'custom' && !customMealName.trim()) {
            toast.error('Please enter a meal name');
            return;
        }

        setLoading(true);
        try{
            const payload = { 
                planned_date: date, 
                meal_type: mealType 
            };
            
            if (mode === 'recipe') {
                payload.recipe_id = selectedRecipe;
            } else {
                payload.custom_meal_name = customMealName.trim();
            }

            const response = await api.post('/mealplan', payload);
            
            let recipeName = '';
            if (mode === 'recipe') {
                const selectedRecipeData = recipes.find(recipe => String(recipe.id) === String(selectedRecipe));
                recipeName = selectedRecipeData?.name || 'Untitled Recipe';
            } else {
                recipeName = customMealName.trim();
            }

            const mealPlanEntry = {
                ...response.data.data.mealPlan,
                recipe_name: recipeName
            };
            
            toast.success('Meal added successfully');
            onSuccess(mealPlanEntry);
            
        } catch (error) {
            console.error('Error adding meal:', error);
            toast.error('Error adding meal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-surface-container animate-in zoom-in-95 duration-300 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Plus className="w-5 h-5 text-tertiary" />
                            <h2 className="font-headline-md text-headline-md text-on-surface">Add to Schedule</h2>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                            {format(new Date(date), 'EEEE, MMM d')} • <span className="text-tertiary">{mealType}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs - Premium Pill Style */}
                <div className="flex bg-surface-container-low p-1 rounded-2xl mb-8 relative z-10">
                    <button
                        onClick={() => setMode('recipe')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            mode === 'recipe' 
                                ? 'bg-white text-tertiary shadow-sm' 
                                : 'text-on-surface-variant opacity-60 hover:opacity-100'
                        }`}
                    >
                        Pick Recipe
                    </button>
                    <button
                        onClick={() => setMode('custom')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            mode === 'custom' 
                                ? 'bg-white text-tertiary shadow-sm' 
                                : 'text-on-surface-variant opacity-60 hover:opacity-100'
                        }`}
                    >
                        Custom Note
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {mode === 'recipe' ? (
                        <>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Find in your collection..."
                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-2xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all font-body-md text-sm"
                                />
                            </div>

                            {/* Recipe List */}
                            <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {filteredRecipes.length > 0 ? (
                                    filteredRecipes.map(recipe => (
                                        <div
                                            key={recipe.id}
                                            onClick={() => setSelectedRecipe(recipe.id)}
                                            className={`group p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${
                                                selectedRecipe === recipe.id
                                                    ? 'border-tertiary bg-tertiary/5 ring-1 ring-tertiary shadow-sm'
                                                    : 'border-surface-container hover:border-tertiary/30 hover:bg-tertiary/5'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                selectedRecipe === recipe.id ? 'border-tertiary bg-tertiary' : 'border-outline-variant'
                                            }`}>
                                                {selectedRecipe === recipe.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold truncate text-sm transition-colors ${selectedRecipe === recipe.id ? 'text-tertiary' : 'text-on-surface'}`}>
                                                    {recipe.name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                                                        {recipe.cuisine_type || 'Custom'}
                                                    </span>
                                                    <div className="w-1 h-1 bg-on-surface-variant opacity-20 rounded-full"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                                                        {recipe.cook_time} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-30">
                                        <ChefHat className="w-12 h-12 mx-auto mb-3" />
                                        <p className="font-bold text-sm">No recipes found</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mb-3 px-1">
                                    Meal Descriptor
                                </label>
                                <input
                                    type="text"
                                    value={customMealName}
                                    onChange={(e) => setCustomMealName(e.target.value)}
                                    placeholder="e.g. Grandma's Sunday Roast"
                                    className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all font-body-md text-base"
                                    autoFocus
                                />
                            </div>
                            <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10 flex gap-3">
                                <Sparkles className="w-5 h-5 text-tertiary shrink-0" />
                                <p className="text-xs text-on-tertiary-fixed-variant opacity-70 leading-relaxed">
                                    Custom meals allow you to plan your day even when you're not using a saved recipe. Great for restaurant nights or quick favorites!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-outline-variant text-on-surface-variant rounded-2xl hover:bg-surface-container font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (mode === 'recipe' ? !selectedRecipe : !customMealName.trim())}
                            className="flex-1 px-6 py-4 bg-tertiary hover:bg-tertiary/90 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-tertiary/20 active:scale-95"
                        >
                            {loading ? 'Securing...' : 'Add to Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealPlanner;
