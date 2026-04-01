import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm, router } from '@inertiajs/react';

export default function ReviewSection({ product, reviews = [], userReview, canReview, sold_count = 0, rating_counts = {} }) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 5,
        title: '',
        comment: '',
        images: []
    });
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const [filterRating, setFilterRating] = useState(0); // 0 = all

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.images && data.images.length > 5) {
            alert('You can upload up to 5 images.');
            return;
        }

        post(route('products.reviews.store', product.slug), {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const handleFilesChange = (e) => {
        const newFiles = Array.from(e.target.files || []);

        // Combine existing images with new ones
        const combinedFiles = [...(data.images || []), ...newFiles];

        // Limit to 5 images
        if (combinedFiles.length > 5) {
            alert('You can only upload a maximum of 5 images.');
            // Take the first 5
            combinedFiles.splice(5);
        }

        setData('images', combinedFiles);

        // Generate previews for all files
        const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Reset file input so the same file can be selected again if needed (though we are appending now)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...previews];
        // Revoke the URL being removed
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const renderStars = (rating, size = 5) => {
        return [...Array(size)].map((_, index) => (
            <span key={index}>
                {index < rating ? (
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                    <StarOutlineIcon className="h-5 w-5 text-yellow-400" />
                )}
            </span>
        ));
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Customer Reviews</h2>

            {/* Review Summary */}
            <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                    {renderStars(Math.round(product.average_rating))}
                    <span className="ml-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {product.average_rating} out of 5 ({product.total_reviews} reviews)
                    </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Sold: <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{sold_count}</span>
                </div>
            </div>

            {/* Rating Filters */}
            <div className="mb-4 flex items-center space-x-2">
                <button onClick={() => setFilterRating(0)} className={`px-3 py-1 rounded transition-colors duration-300 ${filterRating === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>All ({product.total_reviews})</button>
                {[5, 4, 3, 2, 1].map((r) => (
                    <button key={r} onClick={() => setFilterRating(r)} className={`px-3 py-1 rounded transition-colors duration-300 ${filterRating === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        {r}★ ({rating_counts[r] ?? 0})
                    </button>
                ))}
            </div>

            {/* Review Form */}
            {canReview && !userReview && (
                <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                        >
                            Write a Review
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Rating</label>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setData('rating', rating)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            {rating <= data.rating ? (
                                                <StarIcon className="h-8 w-8 text-yellow-400" />
                                            ) : (
                                                <StarOutlineIcon className="h-8 w-8 text-gray-300 dark:text-gray-500 hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors duration-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                    placeholder="Summarize your experience"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                                    Review
                                </label>
                                <textarea
                                    id="comment"
                                    rows={4}
                                    value={data.comment}
                                    onChange={e => setData('comment', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                    placeholder="What did you like or dislike?"
                                />
                                {errors.comment && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
                                )}

                                {/* Image uploads */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Photos (Optional)</label>

                                    <div className="flex flex-wrap gap-4">
                                        {/* Upload Button */}
                                        {data.images.length < 5 && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                                            >
                                                <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add Photo</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">{data.images.length}/5</span>
                                            </div>
                                        )}

                                        {/* Hidden Input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="images[]"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFilesChange}
                                            className="hidden"
                                        />

                                        {/* Previews */}
                                        {previews.map((src, idx) => (
                                            <div key={idx} className="relative w-24 h-24 group">
                                                <img
                                                    src={src}
                                                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                                                    alt={`preview-${idx}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-300"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.images && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-300"
                                >
                                    {processing ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {(reviews || []).filter(r => filterRating === 0 || r.rating === filterRating).map((review) => (
                    <div key={review.review_id ?? review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-300">
                        <div className="flex items-center mb-2">
                            <div className="flex items-center">
                                {renderStars(review.rating)}
                            </div>
                            {review.is_verified_purchase && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-full transition-colors duration-300">
                                    Verified Purchase
                                </span>
                            )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{review.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                            By {review.user.name} on {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                            <div className="mt-3 flex space-x-2">
                                {review.images.map((img) => (
                                    <img key={img.review_image_id ?? img.id} src={`/storage/${img.image_url}`} alt="review" className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}