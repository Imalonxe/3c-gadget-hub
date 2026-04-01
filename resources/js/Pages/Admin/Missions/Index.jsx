import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function Index({ missions }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.missions.destroy', id));
            }
        });
    };

    return (
        <>
            <Head title="Synergy Missions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Missions</h2>
                        <Link
                            href={route('admin.missions.create')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Create Mission
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {missions.map((mission) => (
                                        <tr key={mission.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{mission.name}</div>
                                                <div className="text-sm text-gray-500">{mission.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {mission.slots.map((slot, index) => (
                                                        <span key={slot.id} className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white text-xs font-bold text-gray-600" title={slot.category?.category_name || 'Unknown'}>
                                                            {index + 1}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{mission.slots.length} Slots</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {mission.discount_type === 'percent' ? `${mission.discount_value}%` : `฿${mission.discount_value}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mission.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {mission.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Link href={route('admin.missions.edit', mission.id)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Mission">
                                                        <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(mission.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Mission">
                                                        <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {missions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                No missions found. Create one to get started!
                                            </td>
                                        </tr>
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

Index.layout = page => <AdminLayout children={page} title="Synergy Missions" />;
