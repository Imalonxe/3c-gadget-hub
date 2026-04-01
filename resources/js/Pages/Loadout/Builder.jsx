import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import Modal from '@/Components/Modal';
import { HiLightningBolt, HiCheck, HiPlus, HiX, HiSearch, HiChevronRight, HiLockClosed, HiLockOpen } from 'react-icons/hi';

export default function Builder({ mission, slotsData }) {
    const [selectedItems, setSelectedItems] = useState({});
    const [synergyProgress, setSynergyProgress] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlot, setCurrentSlot] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const filledSlots = Object.keys(selectedItems).length;
        const totalSlots = mission.slots.length;
        setSynergyProgress((filledSlots / totalSlots) * 100);
    }, [selectedItems, mission.slots.length]);

    const openSelectionModal = (slot) => {
        setCurrentSlot(slot);
        setSearchQuery('');
        setIsModalOpen(true);
    };

    const handleSelectItem = (product) => {
        if (currentSlot) {
            setSelectedItems(prev => ({
                ...prev,
                [currentSlot.id]: product
            }));
            setIsModalOpen(false);
            setCurrentSlot(null);
        }
    };

    const handleRemoveItem = (slotId) => {
        setSelectedItems(prev => {
            const newState = { ...prev };
            delete newState[slotId];
            return newState;
        });
    };

    const handleCheckout = () => {
        router.post(route('loadout.cart', mission.id), {
            items: Object.values(selectedItems).map(item => item.id)
        });
    };

    // Filter products for modal
    const filteredProducts = currentSlot
        ? currentSlot.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <MainLayout>
            <Head title={`Mission: ${mission.name}`} />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 relative transition-colors duration-300">
                {/* Header Background */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50 to-gray-50 dark:from-indigo-900/20 dark:to-gray-900 pointer-events-none transition-colors duration-300" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                    {/* Mission Header */}
                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                            Active Mission
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight transition-colors duration-300">
                            {mission.name}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
                            {mission.description}
                        </p>
                    </div>

                    {/* Synergy Core (Progress) */}
                    <div className="mb-16 relative">
                        <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto">
                            <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                Synergy Status
                                {synergyProgress < 100 ? (
                                    <HiLockClosed className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <HiLockOpen className="w-5 h-5 text-green-500 animate-bounce" />
                                )}
                            </span>
                            <span className={`font-bold ${synergyProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {Math.round(synergyProgress)}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-3xl mx-auto overflow-hidden transition-colors duration-300 relative">
                            <div
                                className={`h-full transition-all duration-700 ease-out ${synergyProgress === 100 ? 'bg-green-500 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'bg-indigo-600'}`}
                                style={{ width: `${synergyProgress}%` }}
                            />
                        </div>

                        {/* Visual Reward Popup */}
                        <div className={`absolute left-0 right-0 -bottom-20 text-center transition-all duration-500 transform ${synergyProgress === 100 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                            <div className="inline-flex flex-col items-center">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border-2 border-green-500 transform hover:scale-105 transition-transform duration-300">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                            <HiLockOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount Unlocked!</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                                        {mission.discount_type === 'percent' ? `${mission.discount_value}% OFF` : `฿${Number(mission.discount_value).toLocaleString()} OFF`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {slotsData.map((slot, index) => {
                            const isSelected = !!selectedItems[slot.id];
                            const item = selectedItems[slot.id];

                            return (
                                <div
                                    key={slot.id}
                                    className={`relative group rounded-2xl transition-all duration-300 ${isSelected
                                        ? 'bg-white dark:bg-gray-800 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                                        : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {/* Slot Number Badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur text-gray-500 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-300">
                                            {index + 1}
                                        </span>
                                    </div>

                                    {isSelected ? (
                                        <div className="p-6 h-full flex flex-col">
                                            <div className="relative aspect-square rounded-xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-700 group-hover:scale-[1.02] transition-transform duration-300">
                                                <img
                                                    src={item.image ? `/storage/${item.image}` : 'https://via.placeholder.com/300'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => handleRemoveItem(slot.id)}
                                                    className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                                    title="Remove Item"
                                                >
                                                    <HiX className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mt-auto">
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
                                                    {slot.category_name}
                                                </p>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 transition-colors duration-300">
                                                    {item.name}
                                                </h3>
                                                <div className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                    {Number(item.sale_price) > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-400 line-through">฿{Number(item.price).toLocaleString()}</span>
                                                            <span className="text-red-600 dark:text-red-400">฿{Number(item.sale_price).toLocaleString()}</span>
                                                        </div>
                                                    ) : (
                                                        `฿${Number(item.price).toLocaleString()}`
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openSelectionModal(slot)}
                                            className="w-full h-full p-8 flex flex-col items-center justify-center text-center min-h-[320px]"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 text-gray-400 dark:text-gray-500">
                                                <HiPlus className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                                Add {slot.category_name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                                Select from available items
                                            </p>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                            <div className="text-center sm:text-left">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                    ฿{Object.values(selectedItems).reduce((sum, item) => sum + (Number(item.sale_price) > 0 ? Number(item.sale_price) : Number(item.price)), 0).toLocaleString()}
                                </p>
                            </div>
                            {synergyProgress === 100 && (
                                <div className="hidden sm:block h-10 w-px bg-gray-300 dark:bg-gray-600" />
                            )}
                            {synergyProgress === 100 && (
                                <div className="text-center sm:text-left">
                                    <p className="text-green-600 dark:text-green-400 text-sm font-bold">Discount Applied</p>
                                    <p className="text-lg text-gray-900 dark:text-white opacity-80 transition-colors duration-300">
                                        {mission.discount_type === 'percent' ? `${mission.discount_value}% OFF` : `฿${mission.discount_value} OFF`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={synergyProgress < 100}
                            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center ${synergyProgress === 100
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {synergyProgress === 100 ? (
                                <>
                                    Proceed to Checkout <HiChevronRight className="ml-2 w-5 h-5" />
                                </>
                            ) : (
                                `Complete Mission (${Object.keys(selectedItems).length}/${mission.slots.length})`
                            )}
                        </button>
                    </div>
                </div>

                {/* Product Selection Modal */}
                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="4xl">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg h-[80vh] flex flex-col transition-colors duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                    Select {currentSlot?.category_name}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Choose the best gear for your setup</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <HiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((product) => {
                                    const isOnSale = Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price);
                                    const discountPercent = isOnSale ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100) : 0;

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleSelectItem(product)}
                                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md group overflow-hidden cursor-pointer relative border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            {/* Sale Badge */}
                                            {isOnSale && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-md">
                                                    SALE -{discountPercent}%
                                                </div>
                                            )}

                                            <div className="h-48 relative overflow-hidden bg-white flex items-center justify-center p-4 rounded-t-2xl">
                                                <img
                                                    src={product.image ? `/storage/${product.image}` : '/images/placeholder.jpg'}
                                                    alt={product.name}
                                                    className="max-h-full max-w-full object-contain transition-transform duration-400 transform group-hover:scale-110"
                                                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                                                />
                                            </div>

                                            <div className="p-4 flex flex-col min-h-[120px] bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl transition-colors duration-300">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 h-10 transition-colors duration-300">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto flex items-end justify-between">
                                                    <div>
                                                        {isOnSale ? (
                                                            <div className="space-y-1">
                                                                <div className="text-xs text-gray-400 line-through">฿{Number(product.price).toLocaleString()}</div>
                                                                <p className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors duration-300">฿{Number(product.sale_price).toLocaleString()}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">฿{Number(product.price).toLocaleString()}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded uppercase border border-indigo-100 dark:border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                        Select
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                        No products found matching your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}
