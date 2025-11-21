import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function EditUser({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.user_type === 'admin' ? 'Admin' : 'User',
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    }

    return (
        <AdminLayout title="Edit User">
            <Head title={`Edit User - ${user.name}`} />
            <div className="max-w-2xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Edit User</h1>
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Role</label>
                        <select
                            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={data.role}
                            onChange={e => {
                                console.log('Selected role:', e.target.value);
                                setData('role', e.target.value);
                            }}
                        >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                        {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
                        {/* Debug info */}
                        <div className="mt-2 text-sm text-gray-500">
                            Current role: {data.role}, Original user type: {user.user_type}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={processing}
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
