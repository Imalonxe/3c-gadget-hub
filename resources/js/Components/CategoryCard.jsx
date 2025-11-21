import React from 'react';

export default function CategoryCard({ category, isSelected, href }) {
    return (
        <a
            href={href}
            className={`group relative rounded-lg overflow-hidden h-64 md:h-72 lg:h-80 ${
                isSelected ? 'ring-2 ring-indigo-500' : ''
            }`}
        >
            {/* Image Container with proper aspect ratio handling */}
            <div className="relative w-full h-full bg-gray-100">
                <img
                    src={category.image_url || '/images/placeholder.jpg'}
                    alt={category.category_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                    onError={(e) => { 
                        e.target.src = '/images/placeholder.jpg';
                        e.target.className = 'w-full h-full object-contain bg-gray-200 transition-transform duration-300 group-hover:scale-105';
                        e.target.style.objectFit = 'contain';
                    }}
                />
                
                {/* Fallback background for broken images */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-gray-500 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">{category.category_name}</p>
                    </div>
                </div>
            </div>

            {/* Gradient overlay to improve text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

            {/* Content */}
            <div className="absolute left-4 right-4 bottom-4">
                <div className="bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                    <p className="text-sm opacity-90">{category.products_count || 0} products</p>
                </div>
            </div>
        </a>
    );
}







