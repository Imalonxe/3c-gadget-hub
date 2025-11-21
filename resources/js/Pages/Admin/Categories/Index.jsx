import { useState, useMemo, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmationDialog from '@/Components/ConfirmationDialog';

export default function CategoriesIndex({ categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // all | parents | children
    const searchRef = useRef(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            router.delete(route('admin.categories.destroy', categoryToDelete.category_id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setCategoryToDelete(null);
                },
            });
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            const matchesSearch =
                category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // determine if category is considered a "parent"
            const isParentFlag = typeof category.is_parent !== 'undefined'
                ? !!category.is_parent
                : !category.parent; // fallback: no parent -> treat as parent/top-level

            if (filterMode === 'parents') return isParentFlag;
            if (filterMode === 'children') return !isParentFlag;
            return true;
        });
    }, [categories, searchTerm, filterMode]);

    return (
        <AdminLayout title="Categories">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
                        <Link
                            href={route('admin.categories.create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                        >
                            Create Category
                        </Link>
                    </div>

                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex-1 max-w-md flex items-center gap-3">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search categories..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setSearchTerm(searchRef.current ? searchRef.current.value : '')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Search
                            </button>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setFilterMode('all')}
                                className={`px-3 py-2 rounded-md border ${filterMode === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('parents')}
                                className={`px-3 py-2 rounded-md border ${filterMode === 'parents' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                Parents
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('children')}
                                className={`px-3 py-2 rounded-md border ${filterMode === 'children' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                Children
                            </button>
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Children
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Products
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Featured
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Display Order
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories.map((category) => (
                                    <tr key={category.category_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <Link
                                                href={route('admin.categories.show', category.category_id)}
                                                className="hover:text-indigo-600"
                                            >
                                                {category.category_name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.parent?.category_name || 'None'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.children_count || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.products_count || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    category.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    router.post(route('admin.categories.toggle-featured', category.category_id), {}, {
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                                    category.is_featured
                                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                                title={category.is_featured ? 'Click to remove from homepage' : 'Click to show on homepage'}
                                            >
                                                {category.is_featured ? '⭐ Featured' : 'Not Featured'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.display_order || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('admin.categories.edit', category.category_id)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.category_name}"? This action cannot be undone.`}
            />
        </AdminLayout>
    );
}

