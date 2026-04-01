import React from 'react';
import { Link } from '@inertiajs/react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap -mb-1">
            {links.map((link, key) => {
                let label = link.label;
                if (label.includes('&laquo;')) label = <HiChevronLeft className="w-5 h-5" />;
                if (label.includes('&raquo;')) label = <HiChevronRight className="w-5 h-5" />;

                return link.url === null ? (
                    <div
                        key={key}
                        className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                    >
                        {label}
                    </div>
                ) : (
                    <Link
                        key={key}
                        className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                            }`}
                        href={link.url}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
