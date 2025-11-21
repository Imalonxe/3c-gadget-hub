import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PencilIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Show({ question, auth, canEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showEditHistory, setShowEditHistory] = useState(false);
    const [selectedAnswerImages, setSelectedAnswerImages] = useState([]);
    const [showCommentForms, setShowCommentForms] = useState({});
    const [selectedCommentImages, setSelectedCommentImages] = useState({});
    const [lightboxImage, setLightboxImage] = useState(null);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
        images: []
    });

    const [existingQuestionImages, setExistingQuestionImages] = useState(question.images || []);
    const [newQuestionImages, setNewQuestionImages] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    const editForm = useForm({
        title: question.title,
        content: question.content,
        images: [],
        deleted_image_ids: []
    });

    const handleAnswerImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedAnswerImages.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }
        setSelectedAnswerImages([...selectedAnswerImages, ...files]);
        setData('images', [...selectedAnswerImages, ...files]);
    };

    const removeAnswerImage = (index) => {
        const newImages = selectedAnswerImages.filter((_, i) => i !== index);
        setSelectedAnswerImages(newImages);
        setData('images', newImages);
    };

    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        post(route('answers.store', question.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedAnswerImages([]);
            }
        });
    };

    const handleCommentImageChange = (key, e) => {
        const files = Array.from(e.target.files);
        const currentImages = selectedCommentImages[key] || [];
        if (files.length + currentImages.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }
        const newImages = [...currentImages, ...files];
        setSelectedCommentImages({ ...selectedCommentImages, [key]: newImages });
    };

    const removeCommentImage = (key, index) => {
        const currentImages = selectedCommentImages[key] || [];
        const newImages = currentImages.filter((_, i) => i !== index);
        setSelectedCommentImages({ ...selectedCommentImages, [key]: newImages });
    };

    const handleCommentSubmit = (commentableType, commentableId, e) => {
        e.preventDefault();
        const key = `${commentableType}-${commentableId}`;
        const images = selectedCommentImages[key] || [];
        const content = e.target.querySelector('textarea').value;
        
        const formData = new FormData();
        formData.append('content', content);
        formData.append('commentable_type', commentableType);
        formData.append('commentable_id', commentableId);
        images.forEach((image) => {
            formData.append('images[]', image);
        });

        router.post(route('comments.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCommentForms({ ...showCommentForms, [key]: false });
                setSelectedCommentImages({ ...selectedCommentImages, [key]: [] });
                e.target.reset();
            }
        });
    };

    const openLightbox = (src) => {
        setLightboxImage(src);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    useEffect(() => {
        if (!lightboxImage) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage]);

    const handleQuestionImageChange = (e) => {
        const files = Array.from(e.target.files);
        // existingQuestionImages already reflects deletions, so we just add new ones
        const totalImages = existingQuestionImages.length + newQuestionImages.length + files.length;
        if (totalImages > 5) {
            alert('You can only have up to 5 images total');
            return;
        }
        setNewQuestionImages([...newQuestionImages, ...files]);
        editForm.setData('images', [...newQuestionImages, ...files]);
    };

    const removeNewQuestionImage = (index) => {
        const newImages = newQuestionImages.filter((_, i) => i !== index);
        setNewQuestionImages(newImages);
        editForm.setData('images', newImages);
    };

    const deleteExistingQuestionImage = (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            setDeletedImageIds([...deletedImageIds, imageId]);
            setExistingQuestionImages(existingQuestionImages.filter(img => img.id !== imageId));
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        
        // Prepare form data with images
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', editForm.data.title);
        formData.append('content', editForm.data.content);
        
        // Add deleted image IDs
        if (deletedImageIds.length > 0) {
            formData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
        }
        
        // Add new images
        newQuestionImages.forEach(file => {
            formData.append('images[]', file);
        });

        router.post(route('questions.update', question.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setNewQuestionImages([]);
                setDeletedImageIds([]);
            },
            onError: (errors) => {
                // Set errors to editForm so they display
                editForm.setError(errors);
            }
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        editForm.reset();
        setExistingQuestionImages(question.images || []);
        setNewQuestionImages([]);
        setDeletedImageIds([]);
    };

    return (
        <AppLayout>
            <Head title={question.title} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Question */}
                            <div className="mb-8">
                                <div className="flex items-start justify-between mb-4">
                                    {isEditing ? (
                                        <div className="flex-1">
                                            <TextInput
                                                value={editForm.data.title}
                                                onChange={e => editForm.setData('title', e.target.value)}
                                                className="w-full mb-4"
                                                required
                                            />
                                            {editForm.errors.title && (
                                                <p className="text-sm text-red-500 mb-2">{editForm.errors.title}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                                    )}
                                    
                                    {canEdit && !isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <PencilIcon className="h-4 w-4 mr-2" />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div>
                                        <textarea
                                            value={editForm.data.content}
                                            onChange={e => editForm.setData('content', e.target.value)}
                                            rows="8"
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-4"
                                            required
                                        />
                                        {editForm.errors.content && (
                                            <p className="text-sm text-red-500 mb-2">{editForm.errors.content}</p>
                                        )}
                                        {editForm.errors.edit_limit && (
                                            <p className="text-sm text-red-500 mb-2">{editForm.errors.edit_limit}</p>
                                        )}

                                        {/* Existing Images */}
                                        {existingQuestionImages.length > 0 && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Existing Images (click to delete)
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {existingQuestionImages.map((image, index) => (
                                                        <div key={image.id || index} className="relative group">
                                                            <img
                                                                src={`/storage/${image.image_path}`}
                                                                alt={`Question image ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteExistingQuestionImage(image.id)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Delete image"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add New Images */}
                                        <div className="mb-4">
                                            <label htmlFor="question-images" className="block text-sm font-medium text-gray-700 mb-2">
                                                Add New Images (up to 5 total)
                                            </label>
                                            <input
                                                type="file"
                                                id="question-images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleQuestionImageChange}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                disabled={(existingQuestionImages.length + newQuestionImages.length) >= 5}
                                            />
                                            {editForm.errors.images && (
                                                <p className="mt-1 text-sm text-red-500">{editForm.errors.images}</p>
                                            )}
                                            {newQuestionImages.length > 0 && (
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {newQuestionImages.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt={`New image ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewQuestionImage(index)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove image"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {(existingQuestionImages.length + newQuestionImages.length) >= 5 && (
                                                <p className="mt-1 text-sm text-gray-500">Maximum 5 images reached</p>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <PrimaryButton
                                                onClick={handleEditSubmit}
                                                disabled={editForm.processing}
                                            >
                                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                                            </PrimaryButton>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="prose max-w-none mb-4">{question.content}</div>
                                        
                                        {/* Question Images */}
                                        {question.images && question.images.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {question.images.map((image, index) => (
                                                    <button
                                                        type="button"
                                                        key={image.id || index}
                                                        onClick={() => openLightbox(`/storage/${image.image_path}`)}
                                                        className="relative group focus:outline-none"
                                                    >
                                                        <img
                                                            src={`/storage/${image.image_path}`}
                                                            alt={`Question image ${index + 1}`}
                                                            className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {question.content_before_edit && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => setShowEditHistory(!showEditHistory)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                                >
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {showEditHistory ? 'Hide' : 'Show'} original content
                                                </button>
                                                {showEditHistory && (
                                                    <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Original content:</p>
                                                        <div className="prose max-w-none text-sm text-gray-600">
                                                            {question.content_before_edit}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Edited on: {new Date(question.edited_at).toLocaleString('en-US')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="text-sm text-gray-500 mt-4">
                                    Asked by {question.user.name} on {new Date(question.created_at).toLocaleString('en-US')}
                                    {question.edited_at && (
                                        <span className="ml-2 text-indigo-600">
                                            (edited on {new Date(question.edited_at).toLocaleString('en-US')})
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Answers Section */}
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {question.answers.length} Answers
                                </h2>

                                {/* Answer List */}
                                <div className="space-y-6">
                                    {question.answers.map(answer => (
                                        <div key={answer.id} className="bg-gray-50 p-6 rounded-lg">
                                            <div className="prose max-w-none mb-4">{answer.content}</div>
                                            
                                            {/* Answer Images */}
                                            {answer.images && answer.images.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {answer.images.map((image, index) => (
                                                        <button
                                                            type="button"
                                                            key={image.id || index}
                                                            onClick={() => openLightbox(`/storage/${image.image_path}`)}
                                                            className="relative group focus:outline-none"
                                                        >
                                                            <img
                                                                src={`/storage/${image.image_path}`}
                                                                alt={`Answer image ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Answer Comments */}
                                            {answer.comments && answer.comments.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700">Comments:</h4>
                                                    {answer.comments.map(comment => (
                                                        <div key={comment.id} className="bg-white p-3 rounded border border-gray-200">
                                                            <div className="text-sm text-gray-700">{comment.content}</div>
                                                            {comment.images && comment.images.length > 0 && (
                                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                                    {comment.images.map((image, idx) => (
                                                                        <button
                                                                            type="button"
                                                                            key={image.id || idx}
                                                                            onClick={() => openLightbox(`/storage/${image.image_path}`)}
                                                                            className="focus:outline-none group"
                                                                        >
                                                                            <img
                                                                            src={`/storage/${image.image_path}`}
                                                                            alt={`Comment image ${idx + 1}`}
                                                                                className="w-full h-24 object-cover rounded border border-gray-200 cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                                                                        />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-2">
                                                                by {comment.user?.name} on {new Date(comment.created_at).toLocaleString('en-US')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Comment Form for Answer */}
                                            {auth?.user && (
                                                <div className="mt-4">
                                                    {!showCommentForms[`App\\Models\\Answer-${answer.id}`] ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCommentForms({ ...showCommentForms, [`App\\Models\\Answer-${answer.id}`]: true })}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Add Comment
                                                        </button>
                                                    ) : (
                                                        <form onSubmit={(e) => handleCommentSubmit('App\\Models\\Answer', answer.id, e)} className="mt-2">
                                                            <textarea
                                                                name="content"
                                                                rows="2"
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                                placeholder="Write a comment..."
                                                                required
                                                            />
                                                            <div className="mt-2">
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={(e) => handleCommentImageChange(`App\\Models\\Answer-${answer.id}`, e)}
                                                                    className="text-xs"
                                                                    disabled={(selectedCommentImages[`App\\Models\\Answer-${answer.id}`] || []).length >= 5}
                                                                />
                                                                {(selectedCommentImages[`App\\Models\\Answer-${answer.id}`] || []).length > 0 && (
                                                                    <div className="mt-2 grid grid-cols-5 gap-1">
                                                                        {(selectedCommentImages[`App\\Models\\Answer-${answer.id}`] || []).map((image, idx) => (
                                                                            <div key={idx} className="relative">
                                                                                <img
                                                                                    src={URL.createObjectURL(image)}
                                                                                    alt={`Preview ${idx + 1}`}
                                                                                    className="w-full h-16 object-cover rounded"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeCommentImage(`App\\Models\\Answer-${answer.id}`, idx)}
                                                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mt-2 flex gap-2">
                                                                <PrimaryButton type="submit" className="text-sm py-1 px-3">Post</PrimaryButton>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowCommentForms({ ...showCommentForms, [`App\\Models\\Answer-${answer.id}`]: false });
                                                                        setSelectedCommentImages({ ...selectedCommentImages, [`App\\Models\\Answer-${answer.id}`]: [] });
                                                                    }}
                                                                    className="text-sm py-1 px-3 border rounded"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="text-sm text-gray-500 mt-4">
                                                Answered by {answer.user.name} on {new Date(answer.created_at).toLocaleString('en-US')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Post Answer Form */}
                                {auth?.user && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
                                        <form onSubmit={handleAnswerSubmit}>
                                            <div className="mb-4">
                                                <textarea
                                                    value={data.content}
                                                    onChange={e => setData('content', e.target.value)}
                                                    rows="4"
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="Write your answer here..."
                                                    required
                                                />
                                                {errors.content && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                                                )}
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label htmlFor="answer-images" className="block text-sm font-medium text-gray-700">
                                                    Images (up to 5)
                                                </label>
                                                <input
                                                    type="file"
                                                    id="answer-images"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleAnswerImageChange}
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    disabled={selectedAnswerImages.length >= 5}
                                                />
                                                {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                                                {selectedAnswerImages.length > 0 && (
                                                    <div className="mt-2 grid grid-cols-5 gap-2">
                                                        {selectedAnswerImages.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={URL.createObjectURL(image)}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-24 object-cover rounded-md"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAnswerImage(index)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {selectedAnswerImages.length >= 5 && (
                                                    <p className="mt-1 text-sm text-gray-500">Maximum 5 images reached</p>
                                                )}
                                            </div>
                                            
                                            <PrimaryButton type="submit" disabled={processing}>
                                                Post Answer
                                            </PrimaryButton>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="self-end mb-4 text-white text-2xl font-semibold hover:text-indigo-200 transition-colors"
                    >
                        ×
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Preview"
                        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                    />
                    <p className="mt-3 text-sm text-gray-200">คลิกที่พื้นที่มืดหรือปุ่ม × เพื่อปิด</p>
                </div>
            )}
        </AppLayout>
    );
}