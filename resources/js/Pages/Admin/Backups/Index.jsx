import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatDate } from '@/utils/formatters';
import Swal from 'sweetalert2';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ backups, flash }) {
    const { post, delete: destroy, processing } = useForm();

    const handleCreateBackup = () => {
        Swal.fire({
            title: 'Create Backup?',
            text: "Are you sure you want to create a new database backup?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5', // Indigo 600
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create it!'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.backups.store'));
            }
        });
    };

    const handleDelete = (filename) => {
        Swal.fire({
            title: 'Delete Backup?',
            text: `Are you sure you want to delete ${filename}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.backups.destroy', filename));
            }
        });
    };

    return (
        <>
            <Head title="Database Backups" />

            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Database Backups</h2>
                    <button
                        onClick={handleCreateBackup}
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
                    >
                        {processing ? 'Creating...' : 'Create New Backup'}
                    </button>
                </div>

                {flash.success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{flash.success}</span>
                    </div>
                )}

                {flash.error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{flash.error}</span>
                    </div>
                )}

                <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[800px] divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Filename
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {backups.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No backups found.
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.map((backup) => (
                                            <tr key={backup.filename}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {backup.filename}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {backup.size}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {backup.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end items-center gap-3">
                                                        <a
                                                            href={route('admin.backups.download', backup.filename)}
                                                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                            title="Download Backup"
                                                        >
                                                            <ArrowDownTrayIcon className="w-5 h-5" strokeWidth={1.5} />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(backup.filename)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete Backup"
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

Index.layout = page => <AdminLayout children={page} title="Database Backups" />;
