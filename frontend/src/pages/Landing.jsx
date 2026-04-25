import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    // If user is already logged in, redirect them to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="bg-background text-on-surface font-body-md selection:bg-[#F45B00]/30">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-[#F7F2FA]/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
                <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
                    <div className="text-2xl font-black text-[#F45B00] tracking-tighter font-headline-md">MEALZENO</div>
                    <nav className="hidden md:flex gap-8 items-center">
                        <a className="text-[#F45B00] border-b-2 border-[#F45B00] pb-1 font-headline-md text-sm font-bold tracking-tight" href="#features">Features</a>
                        <a className="text-slate-600 hover:text-[#F45B00] transition-colors font-headline-md text-sm font-bold tracking-tight" href="#how-it-works">How it Works</a>
                        <Link className="text-slate-600 hover:text-[#F45B00] transition-colors font-headline-md text-sm font-bold tracking-tight" to="/login">Login</Link>
                        <Link className="text-slate-600 hover:text-[#F45B00] transition-colors font-headline-md text-sm font-bold tracking-tight" to="/signup">Register</Link>
                    </nav>
                    <Link
                        to="/signup"
                        className="bg-[#F45B00] text-white px-6 py-2.5 rounded-lg font-headline-md text-sm font-bold tracking-tight hover:opacity-90 transition-opacity active:scale-95 duration-200"
                    >
                        Register Now
                    </Link>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-surface-bright">
                    <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
                        <div className="z-10 flex flex-col items-start gap-8">
                            <span className="bg-primary-fixed text-on-primary-fixed px-4 py-1 rounded-full font-label-bold text-sm uppercase">AI-Powered Mise-en-Place</span>
                            <h1 className="font-headline-xl text-5xl md:text-6xl text-on-surface tracking-tight leading-tight">
                                Master Your Kitchen <br /><span className="text-[#F45B00]">with AI</span>
                            </h1>
                            <p className="font-body-lg text-lg text-on-surface-variant max-w-lg leading-relaxed">
                                Turn your pantry into a professional kitchen. Reduce waste, eat better, and automate your meal planning with the world's most intelligent culinary assistant.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 mt-4 w-full sm:w-auto">
                                <Link
                                    to="/signup"
                                    className="bg-[#F45B00] text-on-primary px-8 py-4 rounded-xl font-label-bold text-lg text-center hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                                >
                                    Register Now
                                </Link>
                                <Link
                                    to="/login"
                                    className="border-2 border-outline-variant text-on-surface px-8 py-4 rounded-xl font-label-bold text-lg text-center hover:bg-surface-container-low transition-all active:scale-95"
                                >
                                    Login to Pantry
                                </Link>
                            </div>
                        </div>
                        <div className="relative hidden md:block">
                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-fixed opacity-30 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary-fixed opacity-30 rounded-full blur-3xl"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2">
                                <img className="w-full h-auto object-cover" alt="Kitchen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSppsyUh5KanbyZWUEcI8h0vjCgg8VXMa5jr2OuujOsmlvRrlvPUhP46N3XC8lfrt7myieF349B2-ycLi0Oz5VVh5dsR7jujNfICYKvdjnqd85B36OEYiwPzZ7xfqE-eoxwm0VRK9sUfj4lnPQLr_MDue9jl3EZEGVkr_S--I95JOfQvdRU8qGok--ejXbC2dIg44Vl5MIKcwYECZWBR_J7Rh9H3mWAIvxq2N-P7TgU4RYQV5MF5FaPxWtwP-BFPHReCeoq1NBrf0" />
                            </div>
                            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-outline-variant/30 flex items-center gap-3 -rotate-3">
                                <div className="bg-primary-container p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-white">restaurant_menu</span>
                                </div>
                                <div>
                                    <p className="font-label-bold text-sm">Recipe Generated</p>
                                    <p className="text-xs text-on-surface-variant">Using 4 pantry items</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-surface-container-lowest">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="font-headline-lg text-4xl mb-4">The Intelligent Way to Cook</h2>
                            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Simplify your culinary journey with AI that understands your taste, your inventory, and your schedule.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature: AI Recipes */}
                            <div className="md:col-span-2 bg-[#f5f3f7] rounded-[2.5rem] p-10 border border-gray-200 shadow-lg flex flex-col gap-6">
                                <div className="w-14 h-14 bg-[#FBE9E7] rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#BF360C] text-3xl">auto_awesome</span>
                                </div>
                                <div>
                                    <h3 className="font-headline-md text-3xl mb-4 text-on-surface">AI Recipe Generation</h3>
                                    <p className="font-body-md text-on-surface-variant text-lg leading-relaxed max-w-2xl">
                                        Create recipes from selected ingredients, dietary preferences, cuisine type, servings, and cooking time. Tailored exactly to what you have and what you want.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <span className="bg-[#dccdcd] px-5 py-2 rounded-full font-label-bold text-sm">Gluten Free</span>
                                    <span className="bg-[#dccdcd] px-5 py-2 rounded-full font-label-bold text-sm">Under 30 Min</span>
                                    <span className="bg-[#dccdcd] px-5 py-2 rounded-full font-label-bold text-sm">Italian</span>
                                </div>
                            </div>

                            {/* Feature: Smart Pantry */}
                            <div className="bg-[#F45B00]/5 border border-[#F45B00]/10 rounded-[2rem] p-8 flex flex-col justify-between">
                                <div>
                                    <span className="material-symbols-outlined text-[#F45B00] text-4xl mb-4">inventory_2</span>
                                    <h3 className="font-headline-md text-2xl mb-2">Smart Pantry</h3>
                                    <p className="font-body-md text-on-surface-variant">Track ingredients with ease. Get expiry alerts before things go bad, saving you money and reducing waste.</p>
                                </div>
                                <div className="mt-8 space-y-3">
                                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2 rounded-lg text-lg">🍅</div>
                                            <span className="font-label-bold">Tomatoes</span>
                                        </div>
                                        <span className="text-xs text-error font-bold">Expires: May 09, 2026</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg text-lg">🥛</div>
                                            <span className="font-label-bold">Milk</span>
                                        </div>
                                        <span className="text-xs text-on-surface-variant font-bold">In stock</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature: Weekly Planning */}
                            <div id="how-it-works" className="bg-secondary-fixed rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 md:col-span-3">
                                <div className="flex-1">
                                    <span className="material-symbols-outlined text-secondary text-4xl mb-4">calendar_month</span>
                                    <h3 className="font-headline-md text-2xl mb-2 text-on-secondary-fixed">Seamless Weekly Planning</h3>
                                    <p className="font-body-md text-on-secondary-fixed/70">Build weekly meal plans and manage what to cook next without the Sunday-night stress.</p>
                                    <Link to="/signup" className="inline-block mt-8 bg-secondary text-white px-6 py-3 rounded-xl font-label-bold hover:opacity-90 transition-opacity">Explore Planner</Link>
                                </div>
                                <div className="flex-1 w-full overflow-hidden">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/30 h-32 flex flex-col justify-end">
                                            <div className="text-[10px] uppercase font-bold text-secondary mb-1">Mon</div>
                                            <div className="w-full h-1 bg-secondary/20 rounded-full mb-1"></div>
                                            <div className="font-label-sm text-xs text-secondary-fixed-dim">Pesto Pasta</div>
                                        </div>
                                        <div className="bg-secondary text-white p-4 rounded-xl shadow-lg h-32 flex flex-col justify-end transform scale-105">
                                            <div className="text-[10px] uppercase font-bold text-white/70 mb-1">Tue</div>
                                            <div className="w-full h-1 bg-white/20 rounded-full mb-1"></div>
                                            <div className="font-label-sm text-xs font-bold">Thai Green Curry</div>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/30 h-32 flex flex-col justify-end">
                                            <div className="text-[10px] uppercase font-bold text-secondary mb-1">Wed</div>
                                            <div className="w-full h-1 bg-secondary/20 rounded-full mb-1"></div>
                                            <div className="font-label-sm text-xs text-secondary-fixed-dim">Greek Salad</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Planning & Organization Section (Dark Theme Re-applied) */}
                <section className="py-24 bg-[#1B1B1F]">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="font-headline-lg text-4xl mb-4 text-white tracking-tight">Precision Planning & Organization</h2>
                            <p className="font-body-md text-zinc-400 max-w-2xl mx-auto text-lg">Beyond just recipes, MEALZENO organizes your entire culinary life with clinical precision.</p>
                        </div>

                        {/* 3-Feature Group: Dark Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-10 rounded-[2.5rem] bg-[#323236] border border-white/5 hover:border-[#F45B00]/30 transition-all duration-300 group">
                                <div className="mb-6">
                                    <span className="material-symbols-outlined text-[#F45B00] text-4xl group-hover:scale-110 transition-transform duration-300">restaurant</span>
                                </div>
                                <h4 className="font-headline-md text-2xl mb-4 text-white">Tailored Dietary Profiles</h4>
                                <p className="font-body-md text-zinc-400 leading-relaxed">Fully customizable settings for Vegetarian, Vegan, Gluten-Free, Keto, and more. We adapt to your lifestyle.</p>
                            </div>
                            <div className="p-10 rounded-[2.5rem] bg-[#323236] border border-white/5 hover:border-[#F45B00]/30 transition-all duration-300 group">
                                <div className="mb-6">
                                    <span className="material-symbols-outlined text-[#F45B00] text-4xl group-hover:scale-110 transition-transform duration-300">verified_user</span>
                                </div>
                                <h4 className="font-headline-md text-2xl mb-4 text-white">Allergy Protection</h4>
                                <p className="font-body-md text-zinc-400 leading-relaxed">Set your allergies once, and the AI will filter every suggestion to keep you safe and worry-free.</p>
                            </div>
                            <div className="p-10 rounded-[2.5rem] bg-[#323236] border border-white/5 hover:border-[#F45B00]/30 transition-all duration-300 group">
                                <div className="mb-6">
                                    <span className="material-symbols-outlined text-[#F45B00] text-4xl group-hover:scale-110 transition-transform duration-300">map</span>
                                </div>
                                <h4 className="font-headline-md text-2xl mb-4 text-white">Cuisine Preferences</h4>
                                <p className="font-body-md text-zinc-400 leading-relaxed">Love Italian or Mexican? Tell us your favorites and we'll prioritize those flavors in your suggestions.</p>
                            </div>
                        </div>

                        {/* Convenience & Portability (Integrated Orange Card) */}
                        <div className="mt-16 bg-[#d16526] rounded-[3rem] p-10 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative shadow-2xl shadow-orange-900/20">
                            <div className="flex-1 z-10">
                                <span className="bg-white/40 px-4 py-1 rounded-full font-label-bold text-xs uppercase mb-6 inline-block">On-the-go efficiency</span>
                                <h3 className="font-headline-lg text-4xl md:text-5xl mb-8 leading-tight">Convenience & Portability</h3>
                                <div className="space-y-8">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-xl mb-2">Downloadable PDF Lists</h5>
                                            <p className="text-white/70 text-base leading-relaxed">Take your grocery list anywhere. Generate beautifully formatted PDFs of your shopping items in one click.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-2xl">sync</span>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-xl mb-2">Seamless Pantry Sync</h5>
                                            <p className="text-white/70 text-base leading-relaxed">Check items off your shopping list and they're automatically added to your digital pantry. No manual entry required.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative w-full md:w-auto">
                                <div className="bg-[#323236] p-8 rounded-[2.5rem] border border-white/10 rotate-2 shadow-2xl relative z-10">
                                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#F45B00]/20 rounded-lg flex items-center justify-center text-[#F45B00]">
                                                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                            </div>
                                            <span className="font-bold text-zinc-300">Shopping List</span>
                                        </div>
                                        <span className="material-symbols-outlined text-zinc-500 text-xl">download</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4"><div className="w-5 h-5 border border-zinc-700 rounded-md"></div> <div className="w-32 h-2.5 bg-zinc-800 rounded-full"></div></div>
                                        <div className="flex items-center gap-4"><div className="w-5 h-5 border border-zinc-700 rounded-md"></div> <div className="w-48 h-2.5 bg-zinc-800 rounded-full"></div></div>
                                        <div className="flex items-center gap-4"><div className="w-5 h-5 border border-zinc-700 rounded-md"></div> <div className="w-40 h-2.5 bg-zinc-800 rounded-full"></div></div>
                                        <div className="flex items-center gap-4 opacity-30"><div className="w-5 h-5 bg-[#F45B00] rounded-md flex items-center justify-center"><span className="material-symbols-outlined text-white text-xs">check</span></div> <div className="w-28 h-2.5 bg-zinc-800 rounded-full"></div></div>
                                    </div>
                                </div>
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-surface-container-high overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
                        <h2 className="font-headline-xl text-4xl md:text-5xl mb-8 max-w-4xl mx-auto leading-tight">Ready to revolutionize your <span className="text-primary italic">kitchen experience?</span></h2>
                        <div className="flex flex-col items-center gap-8">
                            <Link
                                to="/signup"
                                className="bg-[#F45B00] text-on-primary px-12 py-5 rounded-full font-label-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                Get Started for Free
                            </Link>
                            <p className="font-label-bold text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> No credit card required • Instant access
                            </p>
                        </div>
                    </div>
                    <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-10">
                        <span className="material-symbols-outlined text-[400px] text-primary select-none" style={{ fontVariationSettings: "'opsz' 48" }}>cooking</span>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="text-xl font-bold text-[#F45B00]">MEALZENO AI</div>
                        <p className="font-headline-md text-xs text-slate-500">© 2026 MEALZENO AI. All rights reserved.</p>
                    </div>
                    <nav className="flex gap-8">
                        <a className="font-headline-md text-xs text-slate-400 hover:text-slate-600 hover:underline transition-all cursor-pointer" href="#">Privacy Policy</a>
                        <a className="font-headline-md text-xs text-slate-400 hover:text-slate-600 hover:underline transition-all cursor-pointer" href="#">Terms of Service</a>
                        <a className="font-headline-md text-xs text-slate-400 hover:text-slate-600 hover:underline transition-all cursor-pointer" href="#">Contact Us</a>
                    </nav>
                    <div className="flex gap-6">
                        <a className="text-slate-400 hover:text-[#F45B00] transition-colors" href="#"><span className="material-symbols-outlined">camera</span></a>
                        <a className="text-slate-400 hover:text-[#F45B00] transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
