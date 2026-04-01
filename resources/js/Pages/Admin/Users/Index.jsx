
import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/utils/formatters';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, NoSymbolIcon, CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

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
        <>
            <Head title="Admin - Users" />
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>
                {/* Search and Filter Section */}
                <div className="mb-6 flex flex-col gap-4">
                    {/* Search Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                defaultValue={filters.search || ''}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        search(e.target.value);
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={() => search(document.querySelector('input[placeholder="Search users by name or email..."]').value)}
                            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                        <button
                            onClick={() => applyVerifiedFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${verifiedFilter === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => applyVerifiedFilter('verified')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${verifiedFilter === 'verified'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Verified
                        </button>
                        <button
                            onClick={() => applyVerifiedFilter('unverified')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${verifiedFilter === 'unverified'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Unverified
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <div className="w-full overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                        <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {isVerified ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.user_type === 'admin' ? 'Admin' : 'User'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex items-center justify-end space-x-4">
                                                <a
                                                    href={route('admin.users.edit', user.id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
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
                                                            onBefore: () => { },
                                                            onSuccess: () => {
                                                                toast.success('User deleted');
                                                            },
                                                            onError: (err) => {
                                                                toast.error('Failed to delete user');
                                                            }
                                                        });
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                </button>

                                                {/* Ban/Unban buttons */}
                                                {user.banned_until && new Date(user.banned_until) > new Date() ? (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: `Unban ${user.name}?`,
                                                                text: 'Are you sure you want to unban this user?',
                                                                icon: 'question',
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Yes, unban',
                                                                cancelButtonText: 'Cancel'
                                                            });

                                                            if (!result.isConfirmed) return;

                                                            router.post(route('admin.users.unban', user.id), {}, {
                                                                onSuccess: () => toast.success('User unbanned successfully'),
                                                                onError: () => toast.error('Failed to unban user')
                                                            });
                                                        }}
                                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Unban User"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            if (currentUserId === user.id) {
                                                                toast.error('You cannot ban yourself.');
                                                                return;
                                                            }
                                                            if (user.user_type === 'admin') {
                                                                toast.error('You cannot ban an administrator.');
                                                                return;
                                                            }

                                                            const { value: formValues } = await Swal.fire({
                                                                title: `Ban ${user.name} `,
                                                                html:
                                                                    '<div class="text-left">' +
                                                                    '<label class="block text-sm font-medium text-gray-700 mb-1">Ban Until</label>' +
                                                                    '<input id="swal-input1" type="datetime-local" class="swal2-input w-full mb-4" style="margin: 0 0 1em 0">' +
                                                                    '<label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>' +
                                                                    '<input id="swal-input2" class="swal2-input w-full" placeholder="Reason for ban" style="margin: 0">' +
                                                                    '</div>',
                                                                focusConfirm: false,
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Ban User',
                                                                preConfirm: () => {
                                                                    return [
                                                                        document.getElementById('swal-input1').value,
                                                                        document.getElementById('swal-input2').value
                                                                    ]
                                                                }
                                                            });

                                                            if (formValues) {
                                                                const [bannedUntil, banReason] = formValues;
                                                                if (!bannedUntil || !banReason) {
                                                                    Swal.showValidationMessage('Please enter both date and reason');
                                                                    return;
                                                                }

                                                                // Convert datetime-local format to proper datetime format
                                                                const formattedDate = bannedUntil.replace('T', ' ') + ':00';

                                                                router.post(route('admin.users.ban', user.id), {
                                                                    banned_until: formattedDate,
                                                                    ban_reason: banReason
                                                                }, {
                                                                    onSuccess: () => toast.success('User banned successfully'),
                                                                    onError: (err) => {
                                                                        toast.error('Failed to ban user');
                                                                        console.error(err);
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Ban User"
                                                    >
                                                        <NoSymbolIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                )}
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
            </div>
        </>
    );
}

UsersIndex.layout = page => <AdminLayout children={page} title="Users" />;
