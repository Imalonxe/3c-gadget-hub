import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProductImageGallery({ images, productName }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-w-1 aspect-h-1">
                <img 
                    src="/images/placeholder.jpg" 
                    alt={productName}
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-w-1 aspect-h-1 group">
                <img 
                    src={`/storage/${images[currentIndex].image_url}`}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                    }}
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                        <button
                            key={image.image_id || index}
                            onClick={() => goToImage(index)}
                            className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                                index === currentIndex 
                                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img 
                                src={`/storage/${image.image_url}`}
                                alt={`${productName} - Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                }}
                            />
                            {image.is_primary && (
                                <div className="absolute top-1 right-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded">
                                    Primary
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}








