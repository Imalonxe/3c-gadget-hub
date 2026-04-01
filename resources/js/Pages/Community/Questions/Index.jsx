import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { ChatBubbleLeftRightIcon, PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Questions({ questions = [], auth, flash = {} }) {
    const [showForm, setShowForm] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        images: []
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }
        setSelectedImages([...selectedImages, ...files]);
        setData('images', [...selectedImages, ...files]);
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setData('images', newImages);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('questions.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedImages([]);
                setShowForm(false);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                if (errors.csrf) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Community Questions" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Community Questions</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400 transition-colors duration-300">Join the discussion and find answers.</p>
                        </div>
                        {auth?.user ? (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150 shadow-sm"
                            >
                                {showForm ? <XMarkIcon className="w-5 h-5 mr-2" /> : <PlusIcon className="w-5 h-5 mr-2" />}
                                {showForm ? 'Close' : 'Ask Question'}
                            </button>
                        ) : (
                            <Link href={route('login')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300">
                                Sign in to ask
                            </Link>
                        )}
                    </div>

                    {/* Flash Messages */}
                    <AnimatePresence>
                        {flash?.success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 rounded-r-md shadow-sm transition-colors duration-300"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">{flash.success}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Ask Question Form */}
                    <AnimatePresence>
                        {showForm && auth?.user && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Create a new discussion</h3>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Title</label>
                                            <TextInput
                                                id="title"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                className="w-full"
                                                placeholder="What's on your mind?"
                                                required
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-500 dark:text-red-400 transition-colors duration-300">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Details</label>
                                            <textarea
                                                id="content"
                                                rows="4"
                                                value={data.content}
                                                onChange={e => setData('content', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                                                placeholder="Describe your question in detail..."
                                                required
                                            />
                                            {errors.content && <p className="mt-1 text-sm text-red-500 dark:text-red-400 transition-colors duration-300">{errors.content}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Images (Optional)</label>
                                            <div className="flex items-center gap-4">
                                                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                                    <PhotoIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                                                    Add Photos
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        disabled={selectedImages.length >= 5}
                                                    />
                                                </label>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                    {selectedImages.length}/5 images selected
                                                </span>
                                            </div>

                                            {selectedImages.length > 0 && (
                                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                                    {selectedImages.map((image, index) => (
                                                        <div key={index} className="relative flex-shrink-0">
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                <XMarkIcon className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <PrimaryButton type="submit" disabled={processing} className="w-full sm:w-auto justify-center">
                                                {processing ? 'Posting...' : 'Post Question'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Questions Feed */}
                    <div className="space-y-4">
                        {questions && questions.length > 0 ? (
                            questions.map((q, index) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={route('questions.show', q.id)} className="block group">
                                        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200">
                                            <div className="flex items-start gap-4">
                                                {/* User Avatar Placeholder */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm border border-indigo-50 dark:border-indigo-800 transition-colors duration-300">
                                                        {q.user?.name ? q.user.name.charAt(0).toUpperCase() : 'A'}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                            {q.title}
                                                        </h3>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2 transition-colors duration-300">
                                                            {new Date(q.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed transition-colors duration-300">
                                                        {q.excerpt || q.content}
                                                    </p>

                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                            <span className="flex items-center gap-1">
                                                                <span className="text-gray-900 dark:text-white transition-colors duration-300">{q.user?.name || 'Anonymous'}</span>
                                                            </span>
                                                            {q.images && q.images.length > 0 && (
                                                                <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 transition-colors duration-300">
                                                                    <PhotoIcon className="w-3.5 h-3.5" />
                                                                    {q.images.length} photos
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${q.answers_count > 0
                                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                                            }`}>
                                                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                                                            {q.answers_count > 0 ? `${q.answers_count} Answers` : 'No answers'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors duration-300">
                                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 transition-colors duration-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No questions yet</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Get started by creating a new discussion.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        New Question
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}