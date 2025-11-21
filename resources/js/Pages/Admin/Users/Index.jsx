import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersIndex({ users = [], filters = {} }) {
    const page = usePage();
    const currentUserId = page.props?.auth?.user?.id;
    const [verifiedFilter, setVerifiedFilter] = React.useState(filters.verified_filter || 'all');

    const search = (searchTerm) => {
        router.get(route('admin.users.index'), { 
            search: searchTerm,
            verified_filter: verifiedFilter 
        }, {
            preserveState: true,
            replace: true
        });
    };

    const applyVerifiedFilter = (filter) => {
        setVerifiedFilter(filter);
        const searchInput = document.querySelector('input[placeholder="Search users by name or email..."]');
        router.get(route('admin.users.index'), { 
            search: searchInput?.value || '',
            verified_filter: filter 
        }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <AdminLayout title="Users">
            <Head title="Admin - Users" />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>
                <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="w-full px-4 py-2 border rounded-md"
                            defaultValue={filters.search || ''}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    search(e.target.value);
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => search(document.querySelector('input[placeholder="Search users by name or email..."]').value)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Search
                        </button>
                        <div className="flex gap-2 border rounded-md overflow-hidden">
                            <button
                                onClick={() => applyVerifiedFilter('all')}
                                className={`px-4 py-2 text-sm font-medium ${
                                    verifiedFilter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                ทั้งหมด
                            </button>
                            <button
                                onClick={() => applyVerifiedFilter('verified')}
                                className={`px-4 py-2 text-sm font-medium ${
                                    verifiedFilter === 'verified'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                ยืนยันแล้ว
                            </button>
                            <button
                                onClick={() => applyVerifiedFilter('unverified')}
                                className={`px-4 py-2 text-sm font-medium ${
                                    verifiedFilter === 'unverified'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                ยังไม่ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length > 0 ? users.map(user => {
                                const isVerified = user.email_verified_at !== null;
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {isVerified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                ยืนยันแล้ว
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                ยังไม่ยืนยัน
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.user_type === 'admin' ? 'Admin' : 'User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleString('th-TH')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(user.updated_at).toLocaleString('th-TH')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex items-center justify-end space-x-4">
                                        <a 
                                            href={route('admin.users.edit', user.id)} 
                                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                        >
                                            Edit
                                        </a>

                                        {/* Delete button with confirmation */}
                                        <button
                                            onClick={async () => {
                                                if (currentUserId === user.id) {
                                                    toast.error('You cannot delete your own account while logged in.');
                                                    return;
                                                }

                                                const result = await Swal.fire({
                                                    title: `Delete ${user.name}?`,
                                                    text: 'Are you sure you want to delete this user? This action cannot be undone.',
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Yes, delete',
                                                    cancelButtonText: 'Cancel'
                                                });

                                                if (!result.isConfirmed) return;

                                                router.delete(route('admin.users.destroy', user.id), {
                                                    onBefore: () => {},
                                                    onSuccess: () => {
                                                        toast.success('User deleted');
                                                    },
                                                    onError: (err) => {
                                                        toast.error('Failed to delete user');
                                                    }
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                            }) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
