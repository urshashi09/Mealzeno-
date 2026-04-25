import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChefHat,
    Home,
    UtensilsCrossed,
    Calendar,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 text-gray-900 font-semibold hover:text-emerald-600 transition-colors flex-shrink-0"
                    >
                        <ChefHat className="w-6 h-6 text-emerald-500" />
                        <span>AI Recipe Generator</span>
                    </Link>

                    <div className="hidden md:flex flex-1 items-center justify-center gap-1">
                        <NavLink to="/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="w-4 h-4" />} label="Pantry" />
                        <NavLink to="/generate" icon={<ChefHat className="w-4 h-4" />} label="Generate" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="w-4 h-4" />} label="Recipes" />
                        <NavLink to="/meal-plan" icon={<Calendar className="w-4 h-4" />} label="Meal Plan" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="w-4 h-4" />} label="Shopping" />
                    </div>

                    <div className="relative ml-auto flex items-center gap-3" ref={dropdownRef}>
                        <Link
                            to="/settings"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen((open) => !open)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-haspopup="menu"
                            aria-expanded={isDropdownOpen}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="font-medium text-gray-900">{user?.name || 'User'}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-14 z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;
