import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, announcements, canCreate }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const { delete: destroy, processing } = useForm();
    const { post } = useForm();

    const confirmDeletion = (announcement) => {
        setSelectedAnnouncement(announcement);
        setConfirmingDeletion(true);
    };

    const deleteAnnouncement = () => {
        destroy(route('admin.announcements.destroy', selectedAnnouncement.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setSelectedAnnouncement(null);
    };

    const toggleActive = (announcement) => {
        post(route('admin.announcements.toggle-active', announcement.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Announcements" />

            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                        {canCreate && (
                            <Link
                                href={route('admin.announcements.create')}
                                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Create New
                            </Link>
                        )}
                    </div>

                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                            <table className="w-full min-w-[800px] divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {announcements.map((announcement) => (
                                        <tr key={announcement.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {announcement.image_path ? (
                                                    <img src={announcement.image_path} alt={announcement.title} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-400">No Image</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{announcement.title || 'Untitled'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(announcement.start_date).toLocaleDateString()} - {new Date(announcement.end_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleActive(announcement)}
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${announcement.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {announcement.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Link
                                                        href={route('admin.announcements.edit', announcement.id)}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Edit Announcement"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDeletion(announcement)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Announcement"
                                                    >
                                                        <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {announcements.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No announcements found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete this announcement?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Once deleted, all of its resources and data will be permanently deleted.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" disabled={processing} onClick={deleteAnnouncement}>
                            Delete Announcement
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Index.layout = page => <AdminLayout children={page} title="Announcements" />;
