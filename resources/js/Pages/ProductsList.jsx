import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProductFilters from '@/Components/ProductFilters';
import MobileFilters from '@/Components/MobileFilters';
import ProductCard from '@/Components/ProductCard';
import EmptyState from '@/Components/EmptyState';
import { FunnelIcon } from '@heroicons/react/24/outline';

export default function ProductsList({ products: initialProducts, attributes, brands = [], auth }) {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    // const router = useRouter(); // Not needed, using router directly

    // Get initial filters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const [selectedFilters] = useState(() => {
        const filters = {};

        // Parse attribute filters
        for (const [key, value] of searchParams.entries()) {
            if (key.startsWith('attr[')) {
                const attributeId = key.slice(5, -1);
                if (!filters.attributes) filters.attributes = {};
                filters.attributes[attributeId] = value.split(',');
            }
        }

        // Parse price range
        if (searchParams.has('min_price')) {
            filters.min_price = searchParams.get('min_price');
        }
        if (searchParams.has('max_price')) {
            filters.max_price = searchParams.get('max_price');
        }

        // Parse brand filters
        if (searchParams.has('brands')) {
            filters.brands = searchParams.get('brands').split(',');
        }

        // Parse availability
        if (searchParams.has('availability')) {
            filters.availability = searchParams.get('availability');
        }

        // Parse sort
        if (searchParams.has('sort')) {
            filters.sort = searchParams.get('sort');
        }

        return filters;
    });

    // Handle filter changes
    const handleFilterChange = (filters) => {
        // Update URL with new filters
        const searchParams = new URLSearchParams();
        
        // Add attribute filters
        if (filters.attributes) {
            Object.entries(filters.attributes).forEach(([attributeId, valueIds]) => {
                searchParams.append(`attr[${attributeId}]`, valueIds.join(','));
            });
        }
        
        // Add price range
        if (filters.min_price) searchParams.append('min_price', filters.min_price);
        if (filters.max_price) searchParams.append('max_price', filters.max_price);
        
        // Add brand filters
        if (filters.brands?.length) {
            searchParams.append('brands', filters.brands.join(','));
        }
        
        // Add availability filter
        if (filters.availability) {
            searchParams.append('availability', filters.availability);
        }
        
        // Add sort
        if (filters.sort) {
            searchParams.append('sort', filters.sort);
        }
        
        // Update URL without reload
        router.get('/products', Object.fromEntries(searchParams), {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AppLayout>
            <Head title="Products" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                    {/* Filters */}
                    <div>
                        <div className="hidden lg:block sticky top-6">
                            <ProductFilters 
                                attributes={attributes}
                                brands={brands}
                                initialFilters={selectedFilters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>

                        {/* Mobile filters dialog */}
                        <MobileFilters
                            open={isMobileFiltersOpen}
                            onClose={() => setIsMobileFiltersOpen(false)}
                            attributes={attributes}
                            brands={brands}
                            initialFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Product grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between pb-4">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="lg:hidden inline-flex items-center gap-x-2 text-gray-600 hover:text-gray-900"
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                >
                                    <FunnelIcon className="h-5 w-5" />
                                    <span>Filters</span>
                                </button>
                            </div>

                            <div className="flex items-center">
                                <label htmlFor="sort" className="sr-only">Sort by</label>
                                <select
                                    id="sort"
                                    className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    value={selectedFilters.sort || 'latest'}
                                    onChange={(e) => handleFilterChange({
                                        ...selectedFilters,
                                        sort: e.target.value
                                    })}
                                >
                                    <option value="latest">Latest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                            {initialProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {initialProducts.length === 0 && (
                            <EmptyState
                                title="No products found"
                                description="Try changing your filters or search criteria"
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}