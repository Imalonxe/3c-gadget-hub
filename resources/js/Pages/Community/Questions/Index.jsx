import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Questions({ questions = [], auth, flash = {} }) {
    // use local state instead of DOM manipulation for visibility
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
                // If CSRF error, reload page after a short delay
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

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {flash?.success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                                {flash.error}
                            </div>
                        )}

                        {errors.rate_limit && (
                            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                                {errors.rate_limit}
                            </div>
                        )}

                        {errors.csrf && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                                <p className="font-medium">{errors.csrf}</p>
                                <p className="text-sm mt-1">Please refresh the page and try again</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Community Questions</h2>
                                <p className="text-sm text-gray-500">Ask and answer questions with the community.</p>
                            </div>

                            {auth?.user ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowForm(s => !s)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        {showForm ? 'Close' : 'Ask a Question'}
                                    </button>
                                </div>
                            ) : (
                                <Link href={route('login')} className="text-sm text-indigo-600 hover:underline">Sign in to ask a question</Link>
                            )}
                        </div>

                        {showForm && auth?.user && (
                            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                        <TextInput
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="mt-1 w-full"
                                            required
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Details</label>
                                        <textarea
                                            id="content"
                                            rows="5"
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                        {errors.rate_limit && (
                                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm text-yellow-800 font-medium">{errors.rate_limit}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                            Images (up to 5)
                                        </label>
                                        <input
                                            type="file"
                                            id="images"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            disabled={selectedImages.length >= 5}
                                        />
                                        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                                        {selectedImages.length > 0 && (
                                            <div className="mt-2 grid grid-cols-5 gap-2">
                                                {selectedImages.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {selectedImages.length >= 5 && (
                                            <p className="mt-1 text-sm text-gray-500">Maximum 5 images reached</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => { reset(); setShowForm(false); }} className="px-4 py-2 bg-white border rounded-md">Cancel</button>
                                        <PrimaryButton type="submit" disabled={processing}>Post Question</PrimaryButton>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {questions && questions.length > 0 ? (
                                questions.map(q => (
                                    <Link key={q.id} href={route('questions.show', q.id)} className="block">
                                        <article className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-2">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">{q.title}</h3>
                                                    <div className="text-sm text-gray-500 text-right">
                                                        <div>{q.answers_count || 0} answers</div>
                                                        <div className="mt-1">{new Date(q.created_at).toLocaleString('en-US')}</div>
                                                    </div>
                                                </div>

                                                {q.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{q.excerpt}</p>}

                                                <div className="mt-3 flex items-center text-sm text-gray-500 gap-3">
                                                    <span>Posted by {q.user?.name || 'Anonymous'}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">No questions yet. Be the first to ask!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}