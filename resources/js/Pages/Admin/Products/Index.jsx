import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmationDialog from '@/Components/ConfirmationDialog';
import { formatDate, formatCurrency, formatDateCompact } from '@/utils/formatters';
import Swal from 'sweetalert2';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ProductsIndex({ products, filters, categories }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Local state for search input to avoid re-rendering on every keystroke
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(route('admin.products.destroy', productToDelete.product_id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    // Generic filter handler
    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value,
        };

        // If searching/filtering, reset to page 1 (Inertia does this automatically usually, but good to be safe if needed)
        // Actually router.get will keep query params.

        router.get(route('admin.products.index'), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleSearch = () => {
        handleFilterChange('search', searchTerm);
    };

    // Bulk Actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(products.data.map(p => p.product_id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleBulkDelete = () => {
        Swal.fire({
            title: 'Delete Selected Products?',
            text: `Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.products.bulk-destroy'), { ids: selectedProducts }, {
                    onSuccess: () => {
                        setSelectedProducts([]);
                        Swal.fire(
                            'Deleted!',
                            'Selected products have been deleted.',
                            'success'
                        );
                    },
                    onError: () => {
                        Swal.fire(
                            'Error!',
                            'Something went wrong.',
                            'error'
                        );
                    }
                });
            }
        });
    };

    return (
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            {selectedProducts.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                                >
                                    <span>Delete ({selectedProducts.length})</span>
                                </button>
                            )}
                            <Link
                                href={route('admin.products.create')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                            >
                                Create Product
                            </Link>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-3">
                            {/* Search */}
                            <div className="flex-1">
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by name, SKU, brand..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    onBlur={handleSearch}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2">
                                <select
                                    id="category"
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    id="status"
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                <select
                                    id="stock_status"
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.stock_status || ''}
                                    onChange={(e) => handleFilterChange('stock_status', e.target.value)}
                                >
                                    <option value="">All Stock</option>
                                    <option value="in_stock">In Stock (&gt;10)</option>
                                    <option value="low_stock">Low Stock (1-10)</option>
                                    <option value="out_of_stock">Out of Stock (0)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                onChange={handleSelectAll}
                                                checked={products.data.length > 0 && selectedProducts.length === products.data.length}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Added
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products && products.data && products.data.length > 0 ? products.data.map((product) => (
                                        <tr key={product.product_id} className={selectedProducts.includes(product.product_id) ? 'bg-indigo-50' : ''}>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    checked={selectedProducts.includes(product.product_id)}
                                                    onChange={() => handleSelectProduct(product.product_id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                                <Link
                                                    href={route('admin.products.show', product.product_id)}
                                                    className="hover:text-indigo-600"
                                                    title={product.product_name || product.name}
                                                >
                                                    {product.product_name || product.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate" title={product.category?.category_name || 'N/A'}>
                                                {product.category?.category_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.sku || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.stock_quantity || 0}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDateCompact(product.created_at)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Link
                                                        href={route('admin.products.edit', product.product_id)}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {products.links && (
                            <div className="mt-4 flex justify-center">
                                <div className="flex space-x-2">
                                    {products.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-2 border rounded-md ${link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
            />
        </>
    );
}

ProductsIndex.layout = page => <AdminLayout children={page} title="Products" />;

