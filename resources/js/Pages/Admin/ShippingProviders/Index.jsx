import { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/Admin/PageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ShippingProvidersIndex({ providers }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState(null);

    const handleDelete = (provider) => {
        Swal.fire({
            title: 'Delete Provider?',
            text: `Are you sure you want to delete "${provider.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.shipping-providers.destroy', provider.id), {
                    onSuccess: () => {
                        Swal.fire(
                            'Deleted!',
                            'Shipping provider has been deleted.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    const toggleActive = (provider) => {
        router.post(route('admin.shipping-providers.toggle-active', provider.id), {}, {
            preserveScroll: true,
        });
    };

    const filteredProviders = useMemo(() => {
        return providers.filter(provider =>
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [providers, searchTerm]);

    return (
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <PageHeader
                        title="Shipping Providers"
                        breadcrumbs={[
                            { label: 'Dashboard', href: route('admin.dashboard') },
                            { label: 'Shipping Providers' }
                        ]}
                        actions={
                            <Link
                                href={route('admin.shipping-providers.create')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors w-full sm:w-auto text-center"
                            >
                                Add New Provider
                            </Link>
                        }
                    />

                    {/* Search */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search shipping providers..."
                            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Providers Table */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[800px] divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Base Fee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Est. Days
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sort Order
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProviders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8">
                                                <EmptyState
                                                    title="No shipping providers found"
                                                    description="Get started by adding a new shipping provider."
                                                    actionLabel="Add New Provider"
                                                    actionUrl={route('admin.shipping-providers.create')}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProviders.map((provider) => (
                                            <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {provider.logo_url && (
                                                            <img
                                                                src={provider.logo_url}
                                                                alt={provider.name}
                                                                className="h-8 w-8 rounded mr-3 object-contain"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {provider.name}
                                                            </div>
                                                            {provider.description && (
                                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                    {provider.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                    {provider.code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                    ฿{parseFloat(provider.base_fee).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {provider.estimated_days} {provider.estimated_days === 1 ? 'day' : 'days'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(provider)}
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all ${provider.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                            }`}
                                                    >
                                                        {provider.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {provider.sort_order}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end items-center gap-3">
                                                        <Link
                                                            href={route('admin.shipping-providers.edit', provider.id)}
                                                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                            title="Edit Provider"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(provider)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete Provider"
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

ShippingProvidersIndex.layout = page => <AdminLayout children={page} title="Shipping Providers" />;
