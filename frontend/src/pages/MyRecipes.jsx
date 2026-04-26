import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [loading, setLoading] = useState(true);

    const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
    const difficulties = ['All', 'easy', 'medium', 'hard'];

    useEffect(() => {
        fetchRecipes();
    }, []);

    useEffect(() => {
        filterRecipes();
    }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);


    const fetchRecipes = async () => {
        try {
            const response = await api.get('/recipe');
            setRecipes(response.data.data.recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };


    const filterRecipes = () => {
        let filtered = recipes;

        if (searchQuery) {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCuisine !== 'All') {
            filtered = filtered.filter(recipe => recipe.cuisine_type === selectedCuisine);
        }

        if (selectedDifficulty !== 'All') {
            filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
        }

        setFilteredRecipes(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/recipe/${id}`);
            setRecipes(recipes.filter(recipe => recipe.id !== id));
            toast.success('Recipe deleted successfully');
        } catch (error) {
            toast.error('Error deleting recipe:', error);
        }
    };

    if(loading){
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#e16926] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-body-md text-on-background">
            <Navbar />

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 pb-24 md:pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="font-headline-xl text-headline-xl text-on-surface font-black tracking-tight mb-2">My Recipes</h1>
                        <p className="text-body-lg text-on-surface-variant opacity-80">Manage and explore your personalized collection of culinary creations.</p>
                    </div>
                    <Link 
                        to="/generate"
                        className="bg-primary text-white px-6 py-3 rounded-full font-label-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChefHat className="w-5 h-5" />
                        Generate New
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container p-6 mb-10">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or description..."
                                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md"
                            />
                        </div>

                        <div className="flex gap-4">
                            {/* Cuisine Filter */}
                            <div className="flex-1 lg:w-48">
                                <select
                                    value={selectedCuisine}
                                    onChange={(e) => setSelectedCuisine(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md appearance-none cursor-pointer"
                                >
                                    {cuisines.map(cuisine => (
                                        <option key={cuisine} value={cuisine}>
                                            {cuisine === 'All' ? 'All Cuisines' : cuisine}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex-1 lg:w-48">
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md appearance-none cursor-pointer"
                                >
                                    {difficulties.map(diff => (
                                        <option key={diff} value={diff}>
                                            {diff === 'All' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipe Count & Active Filters Display */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <p className="text-label-sm font-label-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                        {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'} Found
                    </p>
                </div>

                {/* Recipes Grid */}
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-surface-container p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
                            <ChefHat className="w-12 h-12 text-on-surface-variant opacity-20" />
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                            {recipes.length === 0 ? "You haven't saved any recipes yet" : "No recipes match your search"}
                        </h3>
                        <p className="text-body-md text-on-surface-variant opacity-60 mb-8 max-w-sm mx-auto">
                            {recipes.length === 0 
                                ? "Let AI help you discover something delicious based on your pantry." 
                                : "Try adjusting your filters or search terms to find what you're looking for."}
                        </p>
                        {recipes.length === 0 && (
                            <Link
                                to="/generate"
                                className="bg-primary text-white px-10 py-3.5 rounded-full font-label-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Generate Your First Recipe
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const RecipeCard = ({ recipe, onDelete }) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
            {/* Recipe Image Placeholder */}
            <div className="h-56 bg-surface-container relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center">
                    {recipe.image_url ? (
                        <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <ChefHat className="w-20 h-20 text-on-surface-variant opacity-10 group-hover:text-primary group-hover:opacity-20 transition-all" />
                    )}
                </div>
                {/* Overlay with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Difficulty Tag Overlay */}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                        recipe.difficulty === 'easy' ? 'bg-green-500 text-white border-green-400' :
                        recipe.difficulty === 'medium' ? 'bg-amber-500 text-white border-amber-400' :
                        'bg-red-500 text-white border-red-400'
                    }`}>
                        {recipe.difficulty}
                    </span>
                </div>
            </div>

            {/* Recipe Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <Link to={`/recipes/${recipe.id}`} className="block mb-4">
                        <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                            {recipe.name}
                        </h3>
                        {recipe.description && (
                            <p className="text-body-md text-on-surface-variant opacity-70 mt-2 line-clamp-2 leading-relaxed">
                                {recipe.description}
                            </p>
                        )}
                    </Link>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.dietary_tags && recipe.dietary_tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-secondary/5 text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest border border-secondary/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom Info & Meta */}
                <div className="flex items-center justify-between text-label-sm font-label-bold text-on-surface-variant opacity-60 mb-6 pt-4 border-t border-surface-container">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{totalTime} MINS</span>
                    </div>
                    {recipe.calories && (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            <span>{recipe.calories} CAL</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        to={`/recipes/${recipe.id}`}
                        className="flex-1 bg-[#e16926] text-white text-center py-3 rounded-xl font-label-bold transition-all text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/10"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onDelete(recipe.id)}
                        className="p-3 bg-white border border-outline-variant text-on-surface-variant hover:text-error hover:bg-error-container/20 hover:border-error/30 rounded-xl transition-all active:scale-95"
                        title="Delete recipe"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyRecipes;
