import { useState, useMemo, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/Admin/PageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CategoriesIndex({ categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // all | parents | children
    const searchRef = useRef(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const handleDelete = (category) => {
        Swal.fire({
            title: 'Delete Category?',
            text: `Are you sure you want to delete "${category.category_name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.categories.destroy', category.category_id), {
                    onSuccess: () => {
                        Swal.fire(
                            'Deleted!',
                            'Category has been deleted.',
                            'success'
                        );
                    }
                });
            }
        });
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
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="px-4 py-6 sm:px-0">
                    <PageHeader
                        title="Categories"
                        breadcrumbs={[
                            { label: 'Dashboard', href: route('admin.dashboard') },
                            { label: 'Categories' }
                        ]}
                        actions={
                            <Link
                                href={route('admin.categories.create')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Create Category
                            </Link>
                        }
                    />

                    <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:flex-1 max-w-md flex items-center gap-3">
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
                        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            <button
                                type="button"
                                onClick={() => setFilterMode('all')}
                                className={`px-3 py-2 rounded-md border whitespace-nowrap ${filterMode === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('parents')}
                                className={`px-3 py-2 rounded-md border whitespace-nowrap ${filterMode === 'parents' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                Parents
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('children')}
                                className={`px-3 py-2 rounded-md border whitespace-nowrap ${filterMode === 'children' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} `}
                            >
                                Children
                            </button>
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[800px] divide-y divide-gray-200">
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
                                    {filteredCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8">
                                                <EmptyState
                                                    title="No categories found"
                                                    description="Try adjusting your search or filter to find what you're looking for."
                                                    actionLabel="Create Category"
                                                    actionUrl={route('admin.categories.create')}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategories.map((category) => (
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
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.is_active
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
                                                        className={`px-2 py-1 text-xs font-semibold rounded ${category.is_featured
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
                                                    <div className="flex justify-end items-center gap-3">
                                                        <Link
                                                            href={route('admin.categories.edit', category.category_id)}
                                                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                            title="Edit Category"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(category)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete Category"
                                                        >
                                                            <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

CategoriesIndex.layout = page => <AdminLayout children={page} title="Categories" />;

