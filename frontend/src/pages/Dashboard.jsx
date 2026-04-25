import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [upcomingMeals, setUpcomingMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchDashboardData() {
        try {
            const [recipesRes, pantryRes, mealPlanRes, recentRes, upcomingRes] = await Promise.all([
                api.get('/recipe/stats'),
                api.get('/pantry/stats'),
                api.get('/mealplan/stats'),
                api.get('/recipe/recents'),
                api.get('/mealplan/upcoming?limit=3') // Limited to 3 to match Stitch UI
            ]);
            setStats({
                totalRecipes: Number(recipesRes.data.data.stats.total_recipes) || 0,
                pantryItems: Number(pantryRes.data.data.stats.total_items) || 0,
                mealsThisWeek: Number(mealPlanRes.data.data.stats.this_week_count) || 0
            });

            setRecentRecipes(recentRes.data.data.recipes || []);
            setUpcomingMeals(upcomingRes.data.data.meals || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#F45B00] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 pb-24 md:pb-10">
                {/* Welcome Message */}
                <header className="mb-10">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Dashboard: Welcome back!</h1>
                    <p className="text-body-lg text-on-surface-variant opacity-80">Here's your cooking overview for today.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <StatCard
                        icon="restaurant_menu"
                        label="Total Recipes"
                        value={stats?.totalRecipes}
                        iconBg="bg-[#F45B00]/10"
                        iconColor="text-[#F45B00]"
                    />
                    <StatCard
                        icon="inventory_2"
                        label="Pantry Items"
                        value={stats?.pantryItems}
                        iconBg="bg-secondary/10"
                        iconColor="text-secondary"
                    />
                    <StatCard
                        icon="calendar_today"
                        label="Meals This Week"
                        value={stats?.mealsThisWeek}
                        iconBg="bg-tertiary/10"
                        iconColor="text-tertiary"
                    />
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Generate Recipe Card */}
                    <Link 
                        to="/generate"
                        className="relative overflow-hidden bg-on-tertiary-container text-tertiary rounded-xl p-8 shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-tertiary/10 group cursor-pointer transition-all hover:shadow-lg"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-tertiary text-3xl">auto_awesome</span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg mb-2">Generate Recipe</h2>
                            <p className="font-body-md text-tertiary/80 mb-6 max-w-xs">Create a personalized meal using only what's currently in your pantry.</p>
                            <div className="bg-tertiary text-white w-fit px-6 py-3 rounded-full font-label-bold flex items-center gap-2 active:scale-95 transition-transform">
                                Start Generating
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 h-full w-1/3 bg-tertiary/5 skew-x-12 translate-x-1/2"></div>
                    </Link>

                    {/* Manage Pantry Card */}
                    <Link 
                        to="/pantry"
                        className="relative overflow-hidden bg-[#E0F2F1] text-[#00695C] rounded-xl p-8 shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-[#00695C]/10 group cursor-pointer transition-all hover:shadow-lg"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[#00695C] text-3xl">kitchen</span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg mb-2">Manage Pantry</h2>
                            <p className="font-body-md text-[#00695C]/80 mb-6 max-w-xs">Update your ingredient levels and track expiration dates efficiently.</p>
                            <div className="bg-[#00695C] text-white w-fit px-6 py-3 rounded-full font-label-bold flex items-center gap-2 active:scale-95 transition-transform">
                                Check Inventory
                                <span className="material-symbols-outlined text-sm">list_alt</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 h-full w-1/3 bg-[#00695C]/5 -skew-x-12 translate-x-1/2"></div>
                    </Link>
                </div>

                {/* Bottom Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Recent Recipes */}
                    <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container overflow-hidden">
                        <div className="p-6 border-b border-surface-container flex justify-between items-center">
                            <h3 className="font-headline-md text-headline-md">Recent Recipes</h3>
                            <Link className="text-[#F45B00] font-label-bold flex items-center gap-1 hover:underline" to="/recipes">
                                View all
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="divide-y divide-surface-container">
                            {recentRecipes.length > 0 ? (
                                recentRecipes.slice(0, 3).map((recipe) => (
                                    <Link 
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                            {recipe.image_url ? (
                                                <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-[#F45B00] text-3xl">restaurant</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-on-surface truncate">{recipe.name}</p>
                                            <p className="text-label-sm text-on-surface-variant">
                                                {recipe.cook_time} mins • {recipe.cuisine_type || 'Custom'}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-zinc-300 group-hover:text-[#F45B00] transition-colors">chevron_right</span>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center text-on-surface-variant opacity-60">
                                    No recipes yet. Start generating!
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Upcoming Meals */}
                    <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container flex flex-col">
                        <div className="p-6 border-b border-surface-container flex justify-between items-center">
                            <h3 className="font-headline-md text-headline-md">Upcoming Meals</h3>
                            {upcomingMeals.length > 0 && (
                                <Link className="text-[#F45B00] font-label-bold flex items-center gap-1 hover:underline" to="/meal-plan">
                                    View plan
                                </Link>
                            )}
                        </div>
                        
                        {upcomingMeals.length > 0 ? (
                            <div className="divide-y divide-surface-container flex-1">
                                {upcomingMeals.map((meal) => (
                                    <div key={meal.id} className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary shrink-0">
                                            <span className="material-symbols-outlined">event</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-on-surface truncate">{meal.recipe_name}</p>
                                            <p className="text-label-sm text-on-surface-variant capitalize">
                                                {new Date(meal.meal_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {meal.meal_type}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-zinc-400 text-4xl">event_busy</span>
                                </div>
                                <p className="font-headline-md text-on-surface-variant mb-2">No meals planned yet</p>
                                <p className="text-body-md text-on-surface-variant opacity-60 mb-8 max-w-[240px]">Start planning your week by adding recipes to your calendar.</p>
                                <Link 
                                    to="/meal-plan"
                                    className="border-2 border-[#F45B00] text-[#F45B00] px-8 py-2.5 rounded-full font-label-bold hover:bg-[#F45B00]/5 transition-colors active:scale-95"
                                >
                                    Plan a Meal
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Floating Action Button */}
            <Link 
                to="/generate"
                className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-[#F45B00] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </Link>
        </div>
    );
};

const StatCard = ({ icon, label, value, iconBg, iconColor }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(26,26,30,0.05)] border border-surface-container flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center ${iconColor}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-label-sm text-on-surface-variant font-label-sm">{label}</p>
                <p className="text-headline-md font-headline-md">{value || 0}</p>
            </div>
        </div>
    );
};

export default Dashboard;
