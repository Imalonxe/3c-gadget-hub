import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        base_fee: '',
        estimated_days: '3',
        description: '',
        logo_url: '',
        is_active: true,
        sort_order: '0',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.shipping-providers.store'));
    };

    // Auto-generate code from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);

        // Auto-fill code if it's empty
        if (!data.code) {
            const autoCode = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            setData('code', autoCode);
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.shipping-providers.index')}
                            className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
                        >
                            ← Back to Shipping Providers
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-900">Add New Shipping Provider</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Provider Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    placeholder="e.g., Kerry Express"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Code */}
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className={`mt-1 block w-full rounded-md shadow-sm font-mono ${errors.code
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    placeholder="e.g., kerry"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Unique identifier (lowercase, underscores allowed)
                                </p>
                                {errors.code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                )}
                            </div>

                            {/* Base Fee and Estimated Days - Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Base Fee */}
                                <div>
                                    <label htmlFor="base_fee" className="block text-sm font-medium text-gray-700">
                                        Base Shipping Fee (฿) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="base_fee"
                                        value={data.base_fee}
                                        onChange={(e) => setData('base_fee', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.base_fee
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {errors.base_fee && (
                                        <p className="mt-1 text-sm text-red-600">{errors.base_fee}</p>
                                    )}
                                </div>

                                {/* Estimated Days */}
                                <div>
                                    <label htmlFor="estimated_days" className="block text-sm font-medium text-gray-700">
                                        Estimated Delivery (days) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="estimated_days"
                                        value={data.estimated_days}
                                        onChange={(e) => setData('estimated_days', e.target.value)}
                                        min="1"
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.estimated_days
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                            }`}
                                        placeholder="3"
                                    />
                                    {errors.estimated_days && (
                                        <p className="mt-1 text-sm text-red-600">{errors.estimated_days}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Brief description of the shipping service"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Logo URL */}
                            <div>
                                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    id="logo_url"
                                    value={data.logo_url}
                                    onChange={(e) => setData('logo_url', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="https://example.com/logo.png"
                                />
                                {errors.logo_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>
                                )}
                            </div>

                            {/* Sort Order and Active Status - Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sort Order */}
                                <div>
                                    <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        id="sort_order"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        min="0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="0"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center h-full">
                                    <div className="flex items-center h-10 mt-6">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                            <Link
                                href={route('admin.shipping-providers.index')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Creating...' : 'Create Provider'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Create.layout = page => <AdminLayout children={page} title="Add Shipping Provider" />;
