import { useState, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

export default function ProductFilters({
    attributes,
    brands = [],
    initialFilters = {},
    onFilterChange
}) {
    const [selectedFilters, setSelectedFilters] = useState(initialFilters);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [priceRange, setPriceRange] = useState({
        min: initialFilters.min_price || '',
        max: initialFilters.max_price || ''
    });
    const [availability, setAvailability] = useState(initialFilters.availability || 'all');

    const handleFilterChange = (type, value) => {
        setSelectedFilters(current => {
            const newFilters = { ...current };

            if (type === 'attribute') {
                const { attributeId, valueId, checked } = value;
                if (!newFilters.attributes) {
                    newFilters.attributes = {};
                }
                if (!newFilters.attributes[attributeId]) {
                    newFilters.attributes[attributeId] = [];
                }

                if (checked) {
                    newFilters.attributes[attributeId] = [...newFilters.attributes[attributeId], valueId];
                } else {
                    newFilters.attributes[attributeId] = newFilters.attributes[attributeId]
                        .filter(id => id !== valueId);
                }

                if (newFilters.attributes[attributeId].length === 0) {
                    delete newFilters.attributes[attributeId];
                }
                if (Object.keys(newFilters.attributes).length === 0) {
                    delete newFilters.attributes;
                }
            }
            else if (type === 'price') {
                const { min, max } = value;
                if (min) newFilters.min_price = min;
                else delete newFilters.min_price;
                if (max) newFilters.max_price = max;
                else delete newFilters.max_price;
            }
            else if (type === 'brand') {
                if (!newFilters.brands) newFilters.brands = [];
                if (value.checked) {
                    newFilters.brands = [...newFilters.brands, value.brand];
                } else {
                    newFilters.brands = newFilters.brands.filter(b => b !== value.brand);
                }
                if (newFilters.brands.length === 0) {
                    delete newFilters.brands;
                }
            }
            else if (type === 'availability') {
                if (value === 'all') {
                    delete newFilters.availability;
                } else {
                    newFilters.availability = value;
                }
            }

            return newFilters;
        });
    };

    useEffect(() => {
        onFilterChange(selectedFilters);
    }, [selectedFilters]);

    const toggleGroup = (attributeId) => {
        setExpandedGroups(current => ({
            ...current,
            [attributeId]: !current[attributeId]
        }));
    };

    if (!attributes || attributes.length === 0) {
        return null;
    }

    // Debounced price range change handler
    const debouncedPriceChange = useMemo(
        () => debounce((min, max) => {
            handleFilterChange('price', { min, max });
        }, 500),
        []
    );

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => {
            const newRange = { ...prev, [type]: value };
            debouncedPriceChange(newRange.min, newRange.max);
            return newRange;
        });
    };

    const handleAvailabilityChange = (value) => {
        setAvailability(value);
        handleFilterChange('availability', value);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Filters</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Refine your search with these filters
                </p>
            </div>

            {/* Price Range Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">Price Range</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="min-price" className="sr-only">Minimum price</label>
                        <input
                            type="number"
                            id="min-price"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                        />
                    </div>
                    <div>
                        <label htmlFor="max-price" className="sr-only">Maximum price</label>
                        <input
                            type="number"
                            id="max-price"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Availability Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">Availability</h3>
                <div className="mt-4 space-y-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio text-indigo-600 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                            name="availability"
                            value="all"
                            checked={availability === 'all'}
                            onChange={(e) => handleAvailabilityChange(e.target.value)}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">All</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio text-indigo-600 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                            name="availability"
                            value="in_stock"
                            checked={availability === 'in_stock'}
                            onChange={(e) => handleAvailabilityChange(e.target.value)}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">In Stock</span>
                    </label>
                </div>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-300">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">Brand</h3>
                    <div className="mt-4 space-y-4">
                        {brands.map(brand => (
                            <label key={brand} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox text-indigo-600 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                                    checked={selectedFilters.brands?.includes(brand) || false}
                                    onChange={(e) => handleFilterChange('brand', {
                                        brand,
                                        checked: e.target.checked
                                    })}
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Attribute Filters */}
            {attributes.map(attribute => (
                <div key={attribute.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 transition-colors duration-300">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300"
                        onClick={() => toggleGroup(attribute.id)}
                    >
                        <span>{attribute.display_name}</span>
                        <ChevronDownIcon
                            className={`w-5 h-5 transition-transform text-gray-500 dark:text-gray-400 ${expandedGroups[attribute.id] ? 'transform rotate-180' : ''
                                }`}
                        />
                    </button>

                    {expandedGroups[attribute.id] && (
                        <div className="pt-2 space-y-2">
                            {attribute.values.map(value => (
                                <div key={value.id} className="flex items-center">
                                    {attribute.type === 'color' ? (
                                        <button
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 ${selectedFilters[attribute.id]?.includes(value.id)
                                                    ? 'border-indigo-600'
                                                    : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            style={{ backgroundColor: value.color_code }}
                                            onClick={() => handleFilterChange(
                                                attribute.id,
                                                value.id,
                                                !selectedFilters[attribute.id]?.includes(value.id)
                                            )}
                                        >
                                            <span className="sr-only">{value.display_value}</span>
                                        </button>
                                    ) : (
                                        <label className="flex items-center">
                                            <input
                                                type={attribute.type === 'checkbox' ? 'checkbox' : 'radio'}
                                                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 transition-colors duration-300"
                                                checked={selectedFilters.attributes?.[attribute.id]?.includes(value.id) || false}
                                                onChange={(e) => handleFilterChange('attribute', {
                                                    attributeId: attribute.id,
                                                    valueId: value.id,
                                                    checked: e.target.checked
                                                })}
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                {value.display_value}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {Object.keys(selectedFilters).length > 0 && (
                <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                    onClick={() => {
                        setSelectedFilters({});
                    }}
                >
                    Clear all filters
                </button>
            )}
        </div>
    );
}