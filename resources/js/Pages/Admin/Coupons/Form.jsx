import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import DatePicker from '@/Components/DatePicker';

export default function CouponForm({ coupon = null, categories }) {
    const [isFixedType, setIsFixedType] = useState(coupon ? coupon.type === 'fixed' : true);

    const { data, setData, post, put, processing, errors } = useForm({
        code: coupon?.code || '',
        name: coupon?.name || '',
        description: coupon?.description || '',
        type: coupon?.type || 'fixed',
        value: coupon?.value || '',
        min_order_amount: coupon?.min_order_amount || '',
        max_uses: coupon?.max_uses || '',
        category_id: coupon?.category_id || '',
        is_active: coupon?.is_active ?? true,
        starts_at: coupon?.starts_at || null,
        expires_at: coupon?.expires_at || null,
    });

    const typeOptions = [
        { value: 'fixed', label: 'Fixed Amount' },
        { value: 'percentage', label: 'Percentage' },
        { value: 'free_shipping', label: 'Free Shipping' },
    ];

    const categoryOptions = (categories || []).map((category) => ({
        value: category.category_id ?? category.id,
        label: category.category_name ?? category.name,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (coupon) {
            put(route('admin.coupons.update', coupon.id));
        } else {
            post(route('admin.coupons.store'));
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Code */}
                            <div className="mb-4">
                                <InputLabel htmlFor="code" value="Coupon Code" />
                                <TextInput
                                    id="code"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    required
                                />
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            {/* Name */}
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Type */}
                            <div className="mb-4">
                                <InputLabel htmlFor="type" value="Discount Type" />
                                <SelectInput
                                    id="type"
                                    className="mt-1 block w-full"
                                    value={data.type}
                                    onChange={(e) => {
                                        setData('type', e.target.value);
                                        setIsFixedType(e.target.value === 'fixed');
                                    }}
                                    options={typeOptions}
                                />
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            {/* Value (hidden for free shipping) */}
                            {data.type !== 'free_shipping' && (
                                <div className="mb-4">
                                    <InputLabel htmlFor="value" value="Discount Value" />
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        {isFixedType && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">฿</span>
                                            </div>
                                        )}
                                        <TextInput
                                            id="value"
                                            type="number"
                                            step={isFixedType ? "0.01" : "1"}
                                            min="0"
                                            max={isFixedType ? undefined : "100"}
                                            className={`mt-1 block w-full ${isFixedType ? 'pl-7' : ''}`}
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            required
                                        />
                                        {!isFixedType && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">%</span>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.value} className="mt-2" />
                                </div>
                            )}

                            {/* Minimum Order Amount */}
                            <div className="mb-4">
                                <InputLabel htmlFor="min_order_amount" value="Minimum Order Amount" />
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">฿</span>
                                    </div>
                                    <TextInput
                                        id="min_order_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="mt-1 block w-full pl-7"
                                        value={data.min_order_amount}
                                        onChange={(e) => setData('min_order_amount', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.min_order_amount} className="mt-2" />
                            </div>

                            {/* Maximum Uses */}
                            <div className="mb-4">
                                <InputLabel htmlFor="max_uses" value="Maximum Uses (Optional)" />
                                <TextInput
                                    id="max_uses"
                                    type="number"
                                    min="1"
                                    className="mt-1 block w-full"
                                    value={data.max_uses}
                                    onChange={(e) => setData('max_uses', e.target.value)}
                                />
                                <InputError message={errors.max_uses} className="mt-2" />
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <InputLabel htmlFor="category_id" value="Category (Optional)" />
                                <SelectInput
                                    id="category_id"
                                    className="mt-1 block w-full"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    options={categoryOptions}
                                    placeholder="All Categories"
                                />
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>

                            {/* Active Status */}
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2">Active</span>
                                </label>
                                <InputError message={errors.is_active} className="mt-2" />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <InputLabel htmlFor="starts_at" value="Start Date (Optional)" />
                                    <DatePicker
                                        id="starts_at"
                                        className="mt-1 block w-full"
                                        selected={data.starts_at ? new Date(data.starts_at) : null}
                                        onChange={(date) => setData('starts_at', date)}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                    />
                                    <InputError message={errors.starts_at} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="expires_at" value="Expiry Date (Optional)" />
                                    <DatePicker
                                        id="expires_at"
                                        className="mt-1 block w-full"
                                        selected={data.expires_at ? new Date(data.expires_at) : null}
                                        onChange={(date) => setData('expires_at', date)}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        minDate={data.starts_at ? new Date(data.starts_at) : null}
                                    />
                                    <InputError message={errors.expires_at} className="mt-2" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end mt-6">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : (coupon ? 'Update Coupon' : 'Create Coupon')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}