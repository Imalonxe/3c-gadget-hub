import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { HiArrowLeft, HiPaperClip, HiUser, HiSupport } from 'react-icons/hi';

export default function Show({ auth, ticket }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
        is_internal: false,
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const { data: statusData, setData: setStatusData, put: putStatus, processing: statusProcessing } = useForm({
        status: ticket.status,
        priority: ticket.priority,
    });

    React.useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['ticket'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const submitReply = (e) => {
        e.preventDefault();
        post(route('admin.tickets.reply', ticket.id), {
            onSuccess: () => reset('message'),
        });
    };

    const updateStatus = (e) => {
        e.preventDefault();
        putStatus(route('admin.tickets.update', ticket.id));
    };

    return (
        <>
            <Head title={`Ticket #${ticket.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('admin.tickets.index')} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <HiArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chat Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{ticket.subject}</h2>
                                <p className="text-gray-600 mb-4">{ticket.message}</p>

                                {ticket.attachments && ticket.attachments.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ticket.attachments.map((att) => {
                                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name);
                                                return isImage ? (
                                                    <div key={att.id} className="relative group">
                                                        <img
                                                            src={att.file_path}
                                                            alt={att.file_name}
                                                            className="w-24 h-24 object-cover rounded-md cursor-pointer border border-gray-200 hover:opacity-75 transition"
                                                            onClick={() => {
                                                                setSelectedImage(att.file_path);
                                                                setIsLightboxOpen(true);
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <a
                                                        key={att.id}
                                                        href={att.file_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200 h-10"
                                                    >
                                                        <HiPaperClip className="w-4 h-4 mr-2" />
                                                        {att.file_name}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 text-xs text-gray-400">
                                    Reported by {ticket.user ? ticket.user.name : ticket.name} ({ticket.email}) on {new Date(ticket.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Replies */}
                            <div className="space-y-4">
                                {ticket.replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className={`flex ${reply.user_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-lg rounded-lg p-4 shadow-sm ${reply.is_internal
                                                ? 'bg-yellow-50 border border-yellow-200'
                                                : reply.user_id === auth.user.id
                                                    ? 'bg-indigo-50 border border-indigo-100'
                                                    : 'bg-white border border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center mb-1 space-x-2">
                                                {reply.user_id === auth.user.id ? (
                                                    <HiSupport className="w-4 h-4 text-indigo-600" />
                                                ) : (
                                                    <HiUser className="w-4 h-4 text-gray-600" />
                                                )}
                                                <span className="text-xs font-bold text-gray-700">
                                                    {reply.user.name}
                                                    {reply.is_internal && <span className="ml-2 text-yellow-600">(Internal Note)</span>}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(reply.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-800 whitespace-pre-wrap">{reply.message}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Reply</h3>
                                <form onSubmit={submitReply}>
                                    <div className="mb-4">
                                        <textarea
                                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            rows="4"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Type your reply here..."
                                            required
                                        ></textarea>
                                        <InputError message={errors.message} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="is_internal"
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                checked={data.is_internal}
                                                onChange={(e) => setData('is_internal', e.target.checked)}
                                            />
                                            <label htmlFor="is_internal" className="ml-2 block text-sm text-gray-900">
                                                Internal Note (User won't see this)
                                            </label>
                                        </div>
                                        <PrimaryButton disabled={processing}>Send Reply</PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Info</h3>
                                <form onSubmit={updateStatus} className="space-y-4">
                                    <div>
                                        <InputLabel value="Status" />
                                        <select
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={statusData.status}
                                            onChange={(e) => setStatusData('status', e.target.value)}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <InputLabel value="Priority" />
                                        <select
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={statusData.priority}
                                            onChange={(e) => setStatusData('priority', e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <PrimaryButton className="w-full justify-center" disabled={statusProcessing}>
                                        Update Ticket
                                    </PrimaryButton>
                                </form>

                                <div className="mt-6 border-t pt-4 space-y-3">
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Topic</span>
                                        <p className="text-sm text-gray-900">{ticket.topic}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Email</span>
                                        <p className="text-sm text-gray-900">{ticket.email}</p>
                                    </div>
                                    {ticket.order_id && (
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Related Order</span>
                                            <p className="text-sm text-indigo-600">#{ticket.order_id}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {ticket.metadata && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                                    <div className="space-y-2 text-xs text-gray-600 break-all">
                                        {Object.entries(ticket.metadata).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="font-bold capitalize">{key}: </span>
                                                <span>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Full preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

Show.layout = (page) => {
    // We can't easily access the ticket id here for the title prop of AdminLayout
    // But AdminLayout's title prop is mainly for the header.
    // We can set a generic title or try to use page props if available.
    return <AdminLayout children={page} title="Ticket Details" />;
};
