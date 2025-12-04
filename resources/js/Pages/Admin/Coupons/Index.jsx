import { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/utils/formatters';
import ConfirmationDialog from '@/Components/ConfirmationDialog';
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function CouponsIndex({ coupons }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [selectedCoupons, setSelectedCoupons] = useState([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const handleDelete = (coupon) => {
        setCouponToDelete(coupon);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (couponToDelete) {
            router.delete(route('admin.coupons.destroy', couponToDelete.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setCouponToDelete(null);
                },
            });
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCoupons(filteredCoupons.map(coupon => coupon.id));
        } else {
            setSelectedCoupons([]);
        }
    };

    const handleSelectCoupon = (couponId) => {
        setSelectedCoupons(current => {
            if (current.includes(couponId)) {
                return current.filter(id => id !== couponId);
            } else {
                return [...current, couponId];
            }
        });
    };

    const confirmBulkDelete = () => {
        router.delete(route('admin.coupons.bulk-destroy'), {
            data: { ids: selectedCoupons },
            onSuccess: () => {
                setShowBulkDeleteDialog(false);
                setSelectedCoupons([]);
            },
        });
    };

    const handleBulkAction = (action) => {
        if (!selectedCoupons.length) return;

        switch (action) {
            case 'delete':
                setShowBulkDeleteDialog(true);
                break;
            case 'activate':
                router.put(route('admin.coupons.bulk-update'), {
                    ids: selectedCoupons,
                    data: { is_active: true }
                });
                break;
            case 'deactivate':
                router.put(route('admin.coupons.bulk-update'), {
                    ids: selectedCoupons,
                    data: { is_active: false }
                });
                break;
        }
    };

    const filteredCoupons = useMemo(() => {
        let filtered = coupons.data.filter(coupon =>
            coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
            }
        });
    }, [coupons.data, searchTerm, sortConfig]);

    return (
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
                        <Link
                            href={route('admin.coupons.create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full sm:w-auto text-center"
                        >
                            Create Coupon
                        </Link>
                    </div>

                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search coupons..."
                                className="w-full px-4 py-2 border rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {selectedCoupons.length > 0 && (
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                                <select
                                    className="border rounded-md px-4 py-2"
                                    onChange={(e) => handleBulkAction(e.target.value)}
                                    value=""
                                >
                                    <option value="">Bulk Actions</option>
                                    <option value="activate">Activate</option>
                                    <option value="deactivate">Deactivate</option>
                                    <option value="delete">Delete</option>
                                </select>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    {selectedCoupons.length} selected
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Coupons Table */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[800px] divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                checked={selectedCoupons.length === filteredCoupons.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('code')}
                                        >
                                            <div className="flex items-center">
                                                Code
                                                {sortConfig.key === 'code' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Name
                                                {sortConfig.key === 'name' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('value')}
                                        >
                                            <div className="flex items-center">
                                                Value
                                                {sortConfig.key === 'value' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('is_active')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {sortConfig.key === 'is_active' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('created_at')}
                                        >
                                            <div className="flex items-center">
                                                Created At
                                                {sortConfig.key === 'created_at' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                            onClick={() => handleSort('expires_at')}
                                        >
                                            <div className="flex items-center">
                                                Expires
                                                {sortConfig.key === 'expires_at' && (
                                                    sortConfig.direction === 'asc'
                                                        ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                                                        : <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    checked={selectedCoupons.includes(coupon.id)}
                                                    onChange={() => handleSelectCoupon(coupon.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    href={route('admin.coupons.show', coupon.id)}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {coupon.code}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {coupon.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {coupon.type === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {coupon.type === 'fixed' ? `฿${coupon.value}` : `${coupon.value}%`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(coupon.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {coupon.expires_at ? formatDate(coupon.expires_at) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Link
                                                        href={route('admin.coupons.show', coupon.id)}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="View Coupon"
                                                    >
                                                        <EyeIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.coupons.edit', coupon.id)}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Edit Coupon"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(coupon)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Coupon"
                                                    >
                                                        <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setCouponToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Coupon"
                message={`Are you sure you want to delete the coupon "${couponToDelete?.code}"? This action cannot be undone.`}
            />

            <ConfirmationDialog
                isOpen={showBulkDeleteDialog}
                onClose={() => setShowBulkDeleteDialog(false)}
                onConfirm={confirmBulkDelete}
                title="Delete Selected Coupons"
                message={`Are you sure you want to delete ${selectedCoupons.length} selected coupons? This action cannot be undone.`}
            />
        </>
    );
}

CouponsIndex.layout = page => <AdminLayout children={page} title="Manage Coupons" />;