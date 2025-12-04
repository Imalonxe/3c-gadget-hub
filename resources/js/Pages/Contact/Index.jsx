import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { HiPaperClip, HiX } from 'react-icons/hi';

export default function Index({ auth, orders }) {
    const { csrf_token } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: auth.user ? auth.user.name : '',
        email: auth.user ? auth.user.email : '',
        topic: 'general',
        subject: '',
        message: '',
        order_id: '',
        attachment: null,
        metadata: {},
        _token: csrf_token,
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        // Collect browser metadata
        const metadata = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            url: window.location.href,
        };
        setData('metadata', metadata);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), {
            onSuccess: () => {
                reset('subject', 'message', 'order_id', 'attachment');
                setPreview(null);
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('attachment', file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    return (
        <MainLayout>
            <Head title="Contact Us" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-2xl p-8 sm:p-10 transition-colors duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300 tracking-tight">Contact Us</h1>
                            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300 max-w-2xl mx-auto">
                                We're here to help! Fill out the form below and we'll get back to you within 24 hours.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" className="text-gray-500 dark:text-gray-400 mb-2" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        disabled={!!auth.user}
                                        placeholder="Your Name"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" className="text-gray-500 dark:text-gray-400 mb-2" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        disabled={!!auth.user}
                                        placeholder="your.email@example.com"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="topic" value="Topic" className="text-gray-500 dark:text-gray-400 mb-2" />
                                <div className="relative">
                                    <select
                                        id="topic"
                                        className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 appearance-none"
                                        value={data.topic}
                                        onChange={(e) => setData('topic', e.target.value)}
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Issue</option>
                                        <option value="bug">Report a Bug</option>
                                        <option value="payment">Payment Issue</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <InputError message={errors.topic} className="mt-2" />
                            </div>

                            {data.topic === 'order' && orders.length > 0 && (
                                <div>
                                    <InputLabel htmlFor="order_id" value="Select Order" className="text-gray-500 dark:text-gray-400 mb-2" />
                                    <div className="relative">
                                        <select
                                            id="order_id"
                                            className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 appearance-none"
                                            value={data.order_id}
                                            onChange={(e) => setData('order_id', e.target.value)}
                                        >
                                            <option value="">-- Select an Order --</option>
                                            {orders.map((order) => (
                                                <option key={order.id} value={order.id}>
                                                    {order.display_text}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <InputError message={errors.order_id} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="subject" value="Subject" className="text-gray-500 dark:text-gray-400 mb-2" />
                                <TextInput
                                    id="subject"
                                    type="text"
                                    className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required
                                    placeholder={data.topic === 'order' && data.order_id ? `Issue with Order #${data.order_id}` : 'Brief summary of your inquiry'}
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="message" value="Message" className="text-gray-500 dark:text-gray-400 mb-2" />
                                <textarea
                                    id="message"
                                    className="mt-1 block w-full py-3 px-4 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                    rows="6"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                    placeholder="Please describe your issue in detail..."
                                ></textarea>
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="attachment" value="Attachment (Optional)" className="text-gray-500 dark:text-gray-400 mb-2" />
                                <div className="mt-2 flex items-center justify-between p-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <div className="flex items-center flex-1">
                                        <label
                                            htmlFor="attachment"
                                            className="cursor-pointer inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                        >
                                            <HiPaperClip className="w-5 h-5 mr-2 text-indigo-500" />
                                            Choose File
                                        </label>
                                        <input
                                            id="attachment"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                            {data.attachment ? data.attachment.name : 'No file chosen'}
                                        </span>
                                    </div>

                                    {preview && (
                                        <div className="relative group ml-4">
                                            <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('attachment', null);
                                                    setPreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 group-hover:scale-100"
                                            >
                                                <HiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.attachment} className="mt-2" />
                            </div>

                            <div className="pt-4">
                                <PrimaryButton
                                    className="w-full justify-center py-4 text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
                                    disabled={processing}
                                >
                                    Submit Ticket
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
