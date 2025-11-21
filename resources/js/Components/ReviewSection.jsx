import React from 'react';
import { useState, useRef } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
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
    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side guard for images count
        if (data.images && data.images.length > 5) {
            // Keep consistent with server-side validation
            alert('You can upload up to 5 images.');
            return;
        }

    // The reviews route is defined using the product slug ({product:slug}),
    // so post using the slug to avoid 404s when the route expects the slug.
    post(route('products.reviews.store', product.slug), {
            onSuccess: () => {
                // Reload the page so server-side product stats (average_rating, total_reviews)
                // and the reviews list are refreshed from the backend.
                router.reload();
            }
        });
    };

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            // Trim to 5 on client side
            files.splice(5);
        }

        setData('images', files);

        const p = files.map((file) => URL.createObjectURL(file));
        setPreviews(p);
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
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

            {/* Review Summary */}
            <div className="flex items-center mb-6">
            <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                    {renderStars(Math.round(product.average_rating))}
                    <span className="ml-2 text-gray-600">
                        {product.average_rating} out of 5 ({product.total_reviews} reviews)
                    </span>
                </div>

                <div className="text-sm text-gray-600">
                    Sold: <span className="font-medium">{sold_count}</span>
                </div>
            </div>
            </div>

            {/* Rating Filters */}
            <div className="mb-4 flex items-center space-x-2">
                <button onClick={() => setFilterRating(0)} className={`px-3 py-1 rounded ${filterRating===0? 'bg-blue-600 text-white':'bg-gray-100'}`}>All ({product.total_reviews})</button>
                {[5,4,3,2,1].map((r) => (
                    <button key={r} onClick={() => setFilterRating(r)} className={`px-3 py-1 rounded ${filterRating===r? 'bg-blue-600 text-white':'bg-gray-100'}`}>
                        {r}★ ({rating_counts[r] ?? 0})
                    </button>
                ))}
            </div>

            {/* Review Form */}
            {canReview && !userReview && (
                <div className="mb-8">
                    {!showReviewForm ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Write a Review
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rating</label>
                                <div className="mt-1 flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setData('rating', rating)}
                                            className="focus:outline-none"
                                        >
                                            {rating <= data.rating ? (
                                                <StarIcon className="h-6 w-6 text-yellow-400" />
                                            ) : (
                                                <StarOutlineIcon className="h-6 w-6 text-yellow-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && (
                                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                                    Review
                                </label>
                                <textarea
                                    id="comment"
                                    rows={4}
                                    value={data.comment}
                                    onChange={e => setData('comment', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                {errors.comment && (
                                    <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                                )}

                                {/* Image uploads (optional, up to 5) */}
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700">Upload images (up to 5)</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="images[]"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFilesChange}
                                        className="mt-1"
                                    />
                                    {errors.images && (
                                        <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                                    )}
                                    {errors['images.0'] && (
                                        <p className="mt-1 text-sm text-red-600">{errors['images.0']}</p>
                                    )}

                                    {previews.length > 0 && (
                                        <div className="mt-2 flex space-x-2">
                                            {previews.map((src, idx) => (
                                                <img key={idx} src={src} className="w-20 h-20 object-cover rounded-md border" alt={`preview-${idx}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {(reviews || []).filter(r => filterRating === 0 || r.rating === filterRating).map((review) => (
                    <div key={review.review_id ?? review.id} className="border-b pb-6">
                        <div className="flex items-center mb-2">
                            <div className="flex items-center">
                                {renderStars(review.rating)}
                            </div>
                            {review.is_verified_purchase && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                    Verified Purchase
                                </span>
                            )}
                        </div>
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            By {review.user.name} on {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-2">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                            <div className="mt-3 flex space-x-2">
                                {review.images.map((img) => (
                                    <img key={img.review_image_id ?? img.id} src={`/storage/${img.image_url}`} alt="review" className="w-20 h-20 object-cover rounded-md border" />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}