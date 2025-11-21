import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import MainLayout from '@/Layouts/MainLayout';

export default function Index({ addresses = [] }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        recipient_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        district: '',
        province: '',
        postal_code: '',
        address_type: 'shipping',
        is_default: false
    });

    const [editingId, setEditingId] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('addresses.update', editingId), {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                }
            });
            return;
        }

        post(route('addresses.store'), {
            onSuccess: () => reset()
        });
    };

    const startEdit = (addr) => {
        setEditingId(addr.address_id);
        setData({
            recipient_name: addr.recipient_name || '',
            phone: addr.phone || '',
            address_line1: addr.address_line1 || '',
            address_line2: addr.address_line2 || '',
            district: addr.district || '',
            province: addr.province || '',
            postal_code: addr.postal_code || '',
            address_type: addr.address_type || 'shipping',
            is_default: !!addr.is_default
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
    };

    const confirmDelete = (addr) => {
        if (!confirm('Delete this address?')) return;
        Inertia.delete(route('addresses.destroy', addr.address_id));
    };

    return (
        <MainLayout>
            <Head title="My Addresses" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Saved Addresses</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {addresses.map(addr => (
                            <div key={addr.address_id} className="p-4 bg-white rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold">{addr.recipient_name}</div>
                                        <div className="text-sm text-gray-600">{addr.phone}</div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        {addr.is_default && <div className="text-xs text-green-600 font-semibold">Default</div>}
                                        <div className="space-x-2">
                                            <button onClick={() => startEdit(addr)} className="text-sm text-indigo-600">Edit</button>
                                            <button onClick={() => confirmDelete(addr)} className="text-sm text-red-600">Delete</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-sm text-gray-700">{addr.address_line1}{addr.address_line2 ? ' ' + addr.address_line2 : ''}</div>
                                <div className="text-sm text-gray-500 mt-1">{addr.district}{addr.province ? ', ' + addr.province : ''} {addr.postal_code}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
                                <input value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                                {errors.recipient_name && <div className="text-sm text-red-600">{errors.recipient_name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                                {errors.phone && <div className="text-sm text-red-600">{errors.phone}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                <input value={data.address_line1} onChange={e => setData('address_line1', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                                {errors.address_line1 && <div className="text-sm text-red-600">{errors.address_line1}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address Line 2 (optional)</label>
                                <input value={data.address_line2} onChange={e => setData('address_line2', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">District/City</label>
                                    <input value={data.district} onChange={e => setData('district', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Province</label>
                                    <input value={data.province} onChange={e => setData('province', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                            </div>

                            <div className="flex items-center space-x-3">
                                <label className="inline-flex items-center">
                                    <input type="checkbox" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)} className="form-checkbox" />
                                    <span className="ml-2 text-sm">Set as default address</span>
                                </label>
                            </div>

                            <div className="flex space-x-2">
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                                    {processing ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
