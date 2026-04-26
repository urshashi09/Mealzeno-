import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/pantry', label: 'Pantry' },
        { to: '/generate', label: 'Generate' },
        { to: '/recipes', label: 'Recipes' },
        { to: '/meal-plan', label: 'Meal Plan' },
        { to: '/shopping-list', label: 'Shopping' },
    ];

    return (
        <>
            <header className="bg-[#F7F2FA]/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm top-0 z-50 sticky w-full">
                <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto w-full font-headline-md antialiased">
                    <Link to="/dashboard" className="text-2xl font-black text-[#F45B00] tracking-tighter font-headline-md">
                        MEALZENO
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-8 h-full">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`${
                                        isActive 
                                            ? 'text-[#F45B00] font-bold border-b-2 border-[#F45B00]' 
                                            : 'text-zinc-500 font-medium hover:text-[#F45B00]'
                                    } transition-colors h-full flex items-center px-1`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4 relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 text-zinc-500 hover:bg-zinc-50 transition-all duration-200 rounded-full active:scale-95 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">account_circle</span>
                            {user && <span className="hidden sm:inline text-sm font-medium text-zinc-700">{user.name}</span>}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-zinc-100 bg-white shadow-xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md flex justify-around items-center px-4 pb-safe z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-zinc-200">
                {navLinks.slice(0, 5).map((link) => {
                    const isActive = location.pathname === link.to;
                    const icons = {
                        '/dashboard': 'dashboard',
                        '/pantry': 'inventory_2',
                        '/generate': 'auto_awesome',
                        '/recipes': 'restaurant_menu',
                        '/meal-plan': 'calendar_today',
                        '/shopping-list': 'shopping_cart'
                    };
                    return (
                        <Link 
                            key={link.to}
                            to={link.to}
                            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                                isActive ? 'text-[#F45B00] scale-110' : 'text-zinc-400'
                            }`}
                        >
                            <span className="material-symbols-outlined text-2xl">{icons[link.to]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{link.label === 'Shopping' ? 'List' : link.label === 'Meal Plan' ? 'Plan' : link.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Navbar;
