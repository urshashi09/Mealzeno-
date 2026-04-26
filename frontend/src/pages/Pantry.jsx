import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X, Calendar, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const Pantry = () => {
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPantryItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pantry');
            setItems(response.data.data.items);
        } catch (error) {
            console.error('Error fetching pantry items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpiringItems = async () => {
        try {
            const response = await api.get('/pantry/expiring-soon?days=7');
            setExpiringItems(response.data.data.items);
        } catch (error) {
            console.error('Error fetching expiring items:', error);
        }
    };

    useEffect(() => {
        fetchPantryItems();
        fetchExpiringItems();
    }, []);

    const filteredItems = useMemo(() => {
        let filtered = items;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        return filtered;
    }, [items, searchQuery, selectedCategory]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.delete(`/pantry/${id}`);
            setItems(items.filter(item => item.id !== id));
            toast.success('Item deleted successfully');
            fetchExpiringItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafb] flex flex-col">
                <Navbar />
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#F45B00] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafb]">
            <Navbar />

            <main className="max-w-[1280px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-6 md:py-10 pb-20 lg:pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-headline-sm text-4xl text-on-surface font-black tracking-tight">Pantry</h1>
                        <p className="text-gray-500 mt-1">Manage your ingredients and track expiry dates</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#F45B00] text-white font-bold px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>Add Item</span>
                    </button>
                </div>

                {/* Expiring Soon Alert */}
                {expiringItems.length > 0 && (
                    <div className="bg-amber-50 text-amber-900 rounded-xl p-4 mb-8 flex items-center space-x-4 border border-amber-200 shadow-sm">
                        <div className="bg-white/40 p-2 rounded-full">
                            <span className="material-symbols-outlined text-amber-600">warning</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Items Expiring Soon</p>
                            <p className="text-sm">You have {expiringItems.length} items reaching their expiration date within the next 7 days.</p>
                        </div>
                        <button className="text-sm font-bold underline hover:no-underline hidden sm:block">View All</button>
                    </div>
                )}

                {/* Filter and Search */}
                <div className="mb-10">
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === 'All'
                                    ? 'bg-[#F45B00] text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === category
                                        ? 'bg-[#F45B00] text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <PantryItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => handleDelete(item.id)}
                                isExpiring={expiringItems.some(exp => exp.id === item.id)}
                            />
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">inventory_2</span>
                            <p className="text-gray-400 font-bold">No pantry items found matching your filters.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {(showAddModal || (showEditModal && selectedItem)) && (
                <PantryModal
                    mode={showEditModal ? 'edit' : 'add'}
                    item={selectedItem}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={() => {
                        fetchPantryItems();
                        fetchExpiringItems();
                    }}
                />
            )}
        </div>
    );
};

const PantryItemCard = ({ item, onEdit, onDelete, isExpiring }) => {
    const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
    
    // Determine card styling based on status
    let borderClass = 'border-gray-100';
    let ringClass = '';
    let badge = null;

    if (isExpired) {
        borderClass = 'border-red-200';
        ringClass = 'ring-2 ring-red-100';
        badge = <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Expired</div>;
    } else if (isExpiring) {
        borderClass = 'border-amber-200';
        ringClass = 'ring-2 ring-amber-50';
        badge = <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Expiring Soon</div>;
    } else if (item.is_running_low) {
        borderClass = 'border-orange-200';
        ringClass = 'ring-2 ring-orange-50';
        badge = <div className="absolute top-3 right-3 z-10 bg-[#F45B00] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Running Low</div>;
    }

    // Determine category styling (based on Stitch code feel)
    const categoryColors = {
        'Vegetables': 'bg-green-100 text-green-700',
        'Fruits': 'bg-pink-100 text-pink-700',
        'Dairy': 'bg-blue-100 text-blue-700',
        'Meat': 'bg-red-100 text-red-700',
        'Grains': 'bg-amber-100 text-amber-700',
        'Spices': 'bg-purple-100 text-purple-700',
        'Other': 'bg-gray-100 text-gray-700'
    };

    return (
        <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${borderClass} ${ringClass} relative group h-[320px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
            {badge}
            
            {/* Visual Placeholder (Top half) */}
            <div className={`h-32 w-full flex items-center justify-center shrink-0 ${isExpiring ? 'bg-[#fcf2cd]' : item.is_running_low ? 'bg-[#eedfcc]' : 'bg-[#e4dbe9]'}`}>
                <span className={`material-symbols-outlined text-5xl opacity-60 ${isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : 'text-[#F45B00]'}`}>
                    {item.category === 'Vegetables' ? 'nutrition' : 
                     item.category === 'Dairy' ? 'local_drink' :
                     item.category === 'Meat' ? 'set_meal' :
                     item.category === 'Fruits' ? 'eco' : 'inventory_2'}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight line-clamp-1">{item.name}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${categoryColors[item.category] || categoryColors.Other}`}>
                        {item.category}
                    </span>
                </div>

                <div className="space-y-1 mb-auto">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Quantity</span>
                        <span className={`font-bold ${item.is_running_low ? 'text-[#F45B00]' : 'text-gray-900'}`}>
                            {item.quantity} {item.unit}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Expiry</span>
                        <span className={`font-bold ${isExpired || isExpiring ? 'text-red-500' : 'text-gray-900'}`}>
                            {item.expiry_date ? format(new Date(item.expiry_date), 'MMM dd, yyyy') : 'No Date'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-50">
                    <button 
                        onClick={onEdit}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors"
                    >
                        Update
                    </button>
                    <button 
                        onClick={onDelete}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const PantryModal = ({ mode, item, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        quantity: item?.quantity || '',
        unit: item?.unit || 'pieces',
        category: item?.category || 'Other',
        expiry_date: item?.expiry_date ? format(new Date(item.expiry_date), 'yyyy-MM-dd') : '',
        is_running_low: item?.is_running_low || false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                quantity: parseFloat(formData.quantity),
                expiryDate: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null
            };

            if (mode === 'edit') {
                await api.put(`/pantry/${item.id}`, payload);
                toast.success('Item updated successfully');
            } else {
                await api.post("/pantry", payload);
                toast.success('Item added to pantry');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving pantry item:', error);
            toast.error('Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 font-headline-md tracking-tight">
                        {mode === 'edit' ? 'Update Item' : 'New Pantry Item'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F45B00] outline-none"
                            placeholder="e.g. Fresh Carrots"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F45B00] outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F45B00] outline-none"
                            >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="cups">Cups</option>
                                <option value="tbsp">Tablespoons</option>
                                <option value="tsp">Teaspoons</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F45B00] outline-none"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F45B00] outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#F45B00]/5 border border-orange-100 rounded-2xl">
                        <input
                            type="checkbox"
                            id="running-low"
                            checked={formData.is_running_low}
                            onChange={(e) => setFormData({ ...formData, is_running_low: e.target.checked })}
                            className="w-5 h-5 text-[#F45B00] border-gray-300 rounded focus:ring-[#F45B00]"
                        />
                        <label htmlFor="running-low" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Mark as running low
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-[#F45B00] hover:bg-[#D44F00] text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (mode === 'edit' ? 'Update Item' : 'Add Item')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pantry;
