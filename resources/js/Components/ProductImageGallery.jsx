import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
    enter: (direction) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

export default function ProductImageGallery({ images, productName }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
        setDirection(-1);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToImage = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };



    const openLightbox = () => {
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square w-full group overflow-hidden rounded-lg bg-gray-100">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                            key={currentIndex}
                            src={`/storage/${images[currentIndex].image_url}`}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-contain cursor-grab active:cursor-grabbing"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold) {
                                    goToNext();
                                } else if (swipe > swipeConfidenceThreshold) {
                                    goToPrevious();
                                }
                            }}
                            onTap={() => {
                                // Only open lightbox if it wasn't a drag
                                openLightbox();
                            }}
                            onError={(e) => {
                                e.target.src = '/images/placeholder.jpg';
                            }}
                        />
                    </AnimatePresence>

                    {/* Zoom hint icon */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <MagnifyingGlassPlusIcon className="w-5 h-5" />
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Previous image"
                            >
                                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Next image"
                            >
                                <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${index === currentIndex
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

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
                            aria-label="Close lightbox"
                        >
                            <XMarkIcon className="w-8 h-8" />
                        </button>

                        {/* Image counter */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-lg z-10">
                            {currentIndex + 1} / {images.length}
                        </div>

                        {/* Main image container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-16"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={`/storage/${images[currentIndex].image_url}`}
                                alt={`${productName} - Image ${currentIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                }}
                            />

                            {/* Navigation arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToPrevious();
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeftIcon className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToNext();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                                        aria-label="Next image"
                                    >
                                        <ChevronRightIcon className="w-8 h-8" />
                                    </button>
                                </>
                            )}
                        </motion.div>

                        {/* Thumbnail strip at bottom */}
                        {images.length > 1 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4"
                            >
                                {images.map((image, index) => (
                                    <button
                                        key={image.image_id || index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToImage(index);
                                        }}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? 'border-white ring-2 ring-white/50'
                                            : 'border-white/30 hover:border-white/60'
                                            }`}
                                    >
                                        <img
                                            src={`/storage/${image.image_url}`}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}




