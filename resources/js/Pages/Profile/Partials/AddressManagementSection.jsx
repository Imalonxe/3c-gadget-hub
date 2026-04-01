import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AddressManagementSection({ addresses = [], className = '' }) {
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        recipient_name: '',
        phone: '',
        address_line1: '',
        district: '',
        postal_code: '',
        address_type: 'shipping',
        is_default: false
    });

    const canAddMore = addresses.length < 5;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            put(route('addresses.update', editingId), {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                    setShowForm(false);
                    toast.success('Address updated successfully');
                },
                preserveScroll: true
            });
        } else {
            post(route('addresses.store'), {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    toast.success('Address added successfully');
                },
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.address_limit) {
                        setShowForm(false);
                    }
                }
            });
        }
    };

    const startEdit = (addr) => {
        setEditingId(addr.address_id);
        setShowForm(true);
        setData({
            recipient_name: addr.recipient_name || '',
            phone: addr.phone || '',
            address_line1: addr.address_line1 || '',
            district: addr.district || '',
            postal_code: addr.postal_code || '',
            address_type: addr.address_type || 'shipping',
            is_default: !!addr.is_default
        });
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = (addressId) => {
        Swal.fire({
            title: 'Delete Address?',
            text: 'Are you sure you want to delete this address? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('addresses.destroy', addressId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Address deleted successfully');
                    },
                    onError: () => {
                        toast.error('Failed to delete address');
                    }
                });
            }
        });
    };

    const handleSetDefault = (addressId) => {
        router.post(route('addresses.set_default', addressId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Default address updated');
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Saved Addresses
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Manage your saved addresses. You can save up to 5 addresses.
                </p>
            </header>

            {/* Address List */}
            <div className="mt-6 space-y-4">
                {addresses.length > 0 ? (
                    addresses.map(addr => (
                        <div key={addr.address_id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{addr.recipient_name}</span>
                                        {addr.is_default && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-300">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">{addr.phone}</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        {addr.address_line1}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                                        {[addr.district, addr.postal_code].filter(Boolean).join(', ')}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {!addr.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(addr.address_id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                                        >
                                            Set as default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEdit(addr)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center transition-colors duration-300"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr.address_id)}
                                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center transition-colors duration-300"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">No saved addresses yet.</p>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white transition-colors duration-300">
                            {editingId ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                            onClick={cancelEdit}
                            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-300"
                        >
                            Cancel
                        </button>
                    </div>

                    {!canAddMore && !editingId && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md transition-colors duration-300">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                                You have reached the maximum limit of 5 addresses. Please delete an existing address to add a new one.
                            </p>
                        </div>
                    )}

                    {errors.address_limit && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md transition-colors duration-300">
                            <p className="text-sm text-red-800 dark:text-red-200 transition-colors duration-300">{errors.address_limit}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="recipient_name" value="Full Name" />
                            <TextInput
                                id="recipient_name"
                                type="text"
                                value={data.recipient_name}
                                onChange={e => setData('recipient_name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.recipient_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Phone" />
                            <TextInput
                                id="phone"
                                type="text"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address_line1" value="Address Line 1" />
                            <TextInput
                                id="address_line1"
                                type="text"
                                value={data.address_line1}
                                onChange={e => setData('address_line1', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.address_line1} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="district" value="District/City" />
                            <TextInput
                                id="district"
                                type="text"
                                value={data.district}
                                onChange={e => setData('district', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.district} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="postal_code" value="Postal Code" />
                            <TextInput
                                id="postal_code"
                                type="text"
                                value={data.postal_code}
                                onChange={e => setData('postal_code', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.postal_code} className="mt-2" />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_default"
                                type="checkbox"
                                checked={data.is_default}
                                onChange={e => setData('is_default', e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 transition-colors duration-300"
                            />
                            <label htmlFor="is_default" className="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                Set as default address
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                            </PrimaryButton>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Add New Address Button */}
            {!showForm && canAddMore && (
                <div className="mt-6">
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                        Add New Address
                    </button>
                </div>
            )}

            {!canAddMore && !showForm && (
                <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md transition-colors duration-300">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                        You have reached the maximum limit of 5 addresses. Please delete an existing address to add a new one.
                    </p>
                </div>
            )}
        </section>
    );
}
