import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { HiArrowLeft, HiPaperClip } from 'react-icons/hi';

export default function Show({ ticket }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket.replies.length]);

    useEffect(() => {
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
        post(route('my-tickets.reply', ticket.id), {
            onSuccess: () => reset('message'),
        });
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const [lightboxImage, setLightboxImage] = useState(null);

    return (
        <MainLayout>
            <Head title={`Ticket #${ticket.id}`} />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('my-tickets.index')} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center transition-colors duration-300">
                            <HiArrowLeft className="w-4 h-4 mr-1" /> Back to My Tickets
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{ticket.subject}</h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        <span>ID: #{ticket.id}</span>
                                        <span>•</span>
                                        <span className="capitalize">Topic: {ticket.topic}</span>
                                        <span>•</span>
                                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[ticket.status]} transition-colors duration-300`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8 transition-colors duration-300">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">Original Message</h3>
                                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-colors duration-300">
                                    {ticket.message}
                                </div>

                                {ticket.attachments && ticket.attachments.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">Attachments:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {ticket.attachments.map((attachment) => {
                                                const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(attachment.file_type);
                                                return (
                                                    <div key={attachment.id} className="relative group">
                                                        {isImage ? (
                                                            <div
                                                                className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm aspect-w-1 aspect-h-1"
                                                                onClick={() => setLightboxImage(attachment.file_path)}
                                                            >
                                                                <img
                                                                    src={attachment.file_path}
                                                                    alt={attachment.file_name}
                                                                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                                                                    <span className="sr-only">View full size</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={attachment.file_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                                                            >
                                                                <HiPaperClip className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{attachment.file_name}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 transition-colors duration-300">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 transition-colors duration-300">Conversation</h3>

                                <div className="space-y-6 mb-8">
                                    {ticket.replies.length > 0 ? (
                                        ticket.replies.map((reply) => (
                                            <div key={reply.id} className={`flex ${reply.user_id === ticket.user_id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-3xl rounded-lg p-4 transition-colors duration-300 ${reply.user_id === ticket.user_id ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white transition-colors duration-300">
                                                            {reply.user ? reply.user.name : 'Support Agent'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-4 transition-colors duration-300">
                                                            {new Date(reply.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-colors duration-300">
                                                        {reply.message}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-gray-400 py-4 transition-colors duration-300">
                                            No replies yet.
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {ticket.status !== 'closed' && (
                                    <form onSubmit={submitReply} className="mt-6">
                                        <div className="mb-4">
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                                                Reply
                                            </label>
                                            <textarea
                                                id="message"
                                                rows="4"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                                placeholder="Type your reply here..."
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                required
                                            ></textarea>
                                            {errors.message && <div className="text-red-600 dark:text-red-400 text-sm mt-1 transition-colors duration-300">{errors.message}</div>}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-300"
                                            >
                                                {processing ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img
                            src={lightboxImage}
                            alt="Full size attachment"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                            onClick={() => setLightboxImage(null)}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
