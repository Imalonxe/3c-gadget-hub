import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '@/Layouts/MainLayout';
import { PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
// CouponInput not used on checkout: coupons must be claimed on coupon page

export default function Index({ cartItems, summary, auth, coupons = [], buy_now = false, buy_now_product = null, buy_now_quantity = 1, promptpay_phone = null, addresses = [], shippingProviders = [], ...props }) {
    const [discount, setDiscount] = useState(0);
    const [freeShipping, setFreeShipping] = useState(false);
    // Local state for user's saved coupons (mutable)
    // Local state for user's saved coupons (mutable)
    const [userCoupons, setUserCoupons] = useState(coupons || []);
    // Debug: log coupons prop to help diagnose
    console.log('Checkout page coupons prop:', coupons);

    const { data, setData, post, processing, errors } = useForm({
        shipping_address: {
            full_name: '',
            phone: '',
            address: '',
            city: '',
            postal_code: ''
        },
        payment_method: 'promptpay',
        shipping_provider_id: (shippingProviders && shippingProviders.length > 0) ? shippingProviders[0].id : '',
        notes: '',
        coupon_code: '',
        discount_amount: 0
        ,
        // Buy now fields (if arriving via Buy Now flow they will be populated)
        buy_now: buy_now,
        product: buy_now_product,
        quantity: buy_now_quantity
        ,
        free_shipping: false
        ,
        // Whether to save this address to user's address book
        save_address: false
    });

    // `addresses` prop comes from the server (CheckoutController passes user's saved addresses)
    const serverAddresses = addresses || [];

    // Debug: Log form data
    console.log('Form Data:', data);
    console.log('Errors:', errors);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        const requiredFields = {
            'Full Name': data.shipping_address.full_name,
            'Phone': data.shipping_address.phone,
            'Address': data.shipping_address.address,
            'City': data.shipping_address.city,
            'Postal Code': data.shipping_address.postal_code
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        post(route('checkout.store'), {
            onBefore: () => {
                console.log('🔄 Submitting order...');
            },
            onError: (errors) => {
                console.error('❌ Checkout error:', errors);
                alert(errors.error || Object.values(errors).flat().join('\n'));
            },
            onSuccess: ({ props }) => {
                console.log('✅ Order created successfully');
                // Let Inertia handle the redirect
            },

            onFinish: () => {
                console.log('Form submission completed');
            }
        });
    };

    // Saved coupons selection: allow user to pick a coupon they've already claimed
    const [selectedCouponId, setSelectedCouponId] = useState('');

    const applyCoupon = async (couponId) => {
        // reset
        setDiscount(0);
        setFreeShipping(false);
        setData('coupon_code', '');
        setData('discount_amount', 0);
        setData('free_shipping', false);

        if (!couponId) return;

        const coupon = (userCoupons || []).find(c => String(c.id ?? c.coupon_id) === String(couponId));
        const code = coupon?.code;
        if (!code) return;

        try {
            const res = await axios.post(route('coupons.validate'), { code, subtotal: summary.subtotal });
            if (res && res.data && res.data.valid) {
                if (res.data.free_shipping) {
                    setFreeShipping(true);
                    setDiscount(0);
                    setData('coupon_code', code);
                    setData('discount_amount', 0);
                    setData('free_shipping', true);
                } else {
                    setFreeShipping(false);
                    setDiscount(res.data.discount || 0);
                    setData('coupon_code', code);
                    setData('discount_amount', res.data.discount || 0);
                    setData('free_shipping', false);
                }
            } else {
                alert(res.data?.message || 'Coupon not valid');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to validate coupon';
            alert(msg);
        }
    };

    // NOTE: Public coupons claiming has been removed — coupons must be applied by code only.

    return (
        <MainLayout>
            <Head title="Checkout" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Shipping and Payment Form */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Shipping Information</h2>

                            {errors && Object.keys(errors).length > 0 && (
                                <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 transition-colors duration-300">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Please fill in all required fields.
                                    </p>
                                </div>
                            )}
                            {/* Saved addresses selector */}
                            {(serverAddresses || []).length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Use saved address</label>
                                    <select
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            if (!id) return;
                                            const addr = (serverAddresses || []).find(a => String(a.address_id) === String(id));
                                            if (!addr) return;
                                            // Populate form with selected address
                                            setData('shipping_address', {
                                                full_name: addr.recipient_name || addr.full_name || '',
                                                phone: addr.phone || '',
                                                address: (addr.address_line1 || '') + (addr.address_line2 ? (' ' + addr.address_line2) : ''),
                                                address_line1: addr.address_line1 || '',
                                                address_line2: addr.address_line2 || '',
                                                city: addr.district || addr.province || '',
                                                province: addr.province || '',
                                                postal_code: addr.postal_code || ''
                                            });
                                            // Also set the id so backend can use the saved address
                                            setData('shipping_address.address_id', addr.address_id);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                    >
                                        <option value="">-- Select saved address --</option>
                                        {(serverAddresses || []).map(a => (
                                            <option key={a.address_id} value={a.address_id}>{a.recipient_name} — {a.address_line1}{a.address_line2 ? ' ' + a.address_line2 : ''} {a.district ? ', ' + a.district : ''}</option>
                                        ))}
                                    </select>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">You can manage saved addresses in your profile.</div>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        value={data.shipping_address.full_name}
                                        onChange={e => setData('shipping_address', {
                                            ...data.shipping_address,
                                            full_name: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                    />
                                    {errors.shipping_address?.full_name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shipping_address.full_name}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        Phone Number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={data.shipping_address.phone}
                                            onChange={e => setData('shipping_address', {
                                                ...data.shipping_address,
                                                phone: e.target.value
                                            })}
                                            className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                    </div>
                                    {errors.shipping_address?.phone && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shipping_address.phone}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        Address
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <textarea
                                            id="address"
                                            rows={3}
                                            value={data.shipping_address.address}
                                            onChange={e => setData('shipping_address', {
                                                ...data.shipping_address,
                                                address: e.target.value
                                            })}
                                            className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                    </div>
                                    {errors.shipping_address?.address && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shipping_address.address}</p>
                                    )}
                                </div>

                                {/* City, State, Postal Code Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            value={data.shipping_address.city}
                                            onChange={e => setData('shipping_address', {
                                                ...data.shipping_address,
                                                city: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                        {errors.shipping_address?.city && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shipping_address.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="postal_code"
                                            value={data.shipping_address.postal_code}
                                            onChange={e => setData('shipping_address', {
                                                ...data.shipping_address,
                                                postal_code: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                        {errors.shipping_address?.postal_code && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shipping_address.postal_code}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        Payment Method
                                    </label>
                                    <select
                                        id="payment_method"
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                    >
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="promptpay">PromptPay (QR Payment)</option>
                                    </select>
                                    {errors.payment_method && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payment_method}</p>
                                    )}
                                </div>

                                {/* Shipping Provider Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                                        Shipping Method <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {(shippingProviders || []).map((provider) => {
                                            const isSelected = String(data.shipping_provider_id) === String(provider.id);
                                            return (
                                                <div
                                                    key={provider.id}
                                                    onClick={() => setData('shipping_provider_id', provider.id)}
                                                    className={`
                                                        relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm bg-white dark:bg-gray-800'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            {/* Radio Button */}
                                                            <div className={`
                                                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                                ${isSelected
                                                                    ? 'border-indigo-600 bg-indigo-600'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                }
                                                            `}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                                        <circle cx="6" cy="6" r="3" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            {/* Provider Info */}
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    {provider.logo_url && (
                                                                        <img
                                                                            src={provider.logo_url}
                                                                            alt={provider.name}
                                                                            className="h-6 w-6 object-contain"
                                                                            onError={(e) => e.target.style.display = 'none'}
                                                                        />
                                                                    )}
                                                                    <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                                                                        {provider.name}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Estimated {provider.estimated_days} {provider.estimated_days === 1 ? 'day' : 'days'}
                                                                    </span>
                                                                    {provider.description && (
                                                                        <>
                                                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                                {provider.description}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div className={`text-lg font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            ฿{parseFloat(provider.base_fee).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    {/* Selected Indicator */}
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.shipping_provider_id && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.shipping_provider_id}</p>
                                    )}
                                </div>

                                {/* Bank Transfer Payment Form */}
                                {data.payment_method === 'bank_transfer' && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                Payment Information
                                            </h3>
                                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded-full uppercase tracking-wide transition-colors duration-300">
                                                DEMO
                                            </span>
                                        </div>

                                        <div className="bg-white dark:bg-gray-700 rounded-lg p-5 space-y-4 shadow-inner transition-colors duration-300">
                                            {/* Card Number */}
                                            <div>
                                                <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                    Card Number
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        id="card_number"
                                                        defaultValue=""
                                                        maxLength={19}
                                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 pl-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                                    />
                                                    <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Card Holder Name */}
                                            <div>
                                                <label htmlFor="card_holder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                    Card Holder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="card_holder"
                                                    defaultValue=""
                                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                                />
                                            </div>

                                            {/* Expiry and CVV */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="expiry"
                                                        defaultValue=""
                                                        maxLength={5}
                                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="cvv"
                                                        defaultValue=""
                                                        maxLength={4}
                                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Note */}
                                        <div className="mt-4 flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Secure Payment:</span> This is a secure mock payment gateway. Your data is encrypted and no actual payment will be processed.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                    />
                                </div>

                                {/* Save address checkbox */}
                                <div className="flex items-center space-x-3">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.save_address}
                                            onChange={e => setData('save_address', e.target.checked)}
                                            className="form-checkbox h-4 w-4 text-indigo-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">Save this address to my address book</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${processing && 'opacity-75 cursor-not-allowed'
                                        }`}
                                >
                                    {processing ? 'Processing...' : 'Place Order'}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Order Summary</h2>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.cart_item_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden transition-colors duration-300">
                                            <img
                                                src={item.product?.images?.[0]?.image_url ? `/storage/${item.product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                alt={item.product?.product_name || 'Product'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{item.product?.product_name || 'Unknown Product'}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-medium w-full sm:w-auto text-right sm:text-left text-gray-900 dark:text-white transition-colors duration-300">
                                            ฿{(item.price_at_add * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4 transition-colors duration-300">
                                {/** Recompute totals client-side when a coupon discount is applied */}
                                {(() => {
                                    const rawSubtotal = Number(summary?.subtotal ?? 0);

                                    // Get selected provider's fee
                                    const selectedProvider = (shippingProviders || []).find(p => String(p.id) === String(data.shipping_provider_id));
                                    const providerFee = selectedProvider ? Number(selectedProvider.base_fee) : Number(summary?.shipping ?? 0);

                                    // If coupon gives free shipping, zero the shipping for display
                                    const isLevelFreeShipping = summary.level_free_shipping_available;
                                    const rawShipping = (freeShipping || isLevelFreeShipping) ? 0 : providerFee;

                                    // Apply discount to subtotal (never below zero)
                                    const missionDiscount = Number(summary.mission_discount || 0);
                                    const levelDiscount = Number(summary.level_discount || 0);
                                    const couponDiscount = Number(discount || 0);

                                    // Note: Server logic applies level discount on (subtotal - mission).
                                    // Here we just sum them up for display simplicity, but we should be careful if the math drifts.
                                    // Since levelDiscount is passed from server (calculated correctly there), we can just subtract it.
                                    // But wait, if subtotal changes (e.g. shipping provider change doesn't affect subtotal), 
                                    // so levelDiscount from server is correct for the current cart.

                                    const totalDiscount = missionDiscount + levelDiscount + couponDiscount;

                                    const subtotalAfterDiscount = Math.max(0, rawSubtotal - totalDiscount);
                                    const taxAfter = subtotalAfterDiscount * 0.07; // same 7% VAT
                                    const totalAfter = subtotalAfterDiscount + taxAfter + rawShipping;

                                    return (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                <span>Subtotal</span>
                                                <span className="font-medium text-gray-900 dark:text-white">฿{rawSubtotal.toFixed(2)}</span>
                                            </div>

                                            {summary.mission_discount > 0 && (
                                                <div className="flex justify-between text-sm text-indigo-700 dark:text-indigo-400 transition-colors duration-300">
                                                    <span>Mission: {summary.mission_name}</span>
                                                    <span className="font-medium">-฿{Number(summary.mission_discount).toFixed(2)}</span>
                                                </div>
                                            )}

                                            {summary.level_discount > 0 && (
                                                <div className="flex justify-between text-sm text-purple-700 dark:text-purple-400 transition-colors duration-300">
                                                    <span>Level Discount (Lvl {auth.user.level})</span>
                                                    <span className="font-medium">-฿{Number(summary.level_discount).toFixed(2)}</span>
                                                </div>
                                            )}

                                            {discount > 0 && (
                                                <div className="flex justify-between text-sm text-green-700 dark:text-green-400 transition-colors duration-300">
                                                    <span>Coupon</span>
                                                    <span className="font-medium">-฿{Number(discount).toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                <span>Tax</span>
                                                <span className="font-medium text-gray-900 dark:text-white">฿{taxAfter.toFixed(2)}</span>
                                            </div>

                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                <span>
                                                    Shipping {selectedProvider && <span className="text-xs text-gray-500 dark:text-gray-500">({selectedProvider.name})</span>}
                                                    {summary.level_free_shipping_available && (
                                                        <span className="text-xs text-purple-600 ml-1">
                                                            (Free - Level Benefit
                                                            {summary.level_free_shipping_limit ? ` ${summary.level_free_shipping_usage}/${summary.level_free_shipping_limit} used` : ''})
                                                        </span>
                                                    )}
                                                    {!summary.level_free_shipping_available && summary.level_free_shipping_limit && summary.level_free_shipping_usage >= summary.level_free_shipping_limit && (
                                                        <span className="text-xs text-red-500 ml-1">
                                                            (Free Shipping Limit Reached: {summary.level_free_shipping_usage}/{summary.level_free_shipping_limit})
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {rawShipping === 0 ? 'Free' : `฿${rawShipping.toFixed(2)}`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                                <span>Total</span>
                                                <span>฿{totalAfter.toFixed(2)}</span>
                                            </div>
                                        </>
                                    );
                                })()}

                                {/* Coupon Selection */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">Apply Coupon</h3>
                                    </div>

                                    {userCoupons && userCoupons.length > 0 ? (
                                        <div className="space-y-2">
                                            {/* No coupon option */}
                                            <div
                                                onClick={() => {
                                                    setSelectedCouponId('');
                                                    applyCoupon('');
                                                }}
                                                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${selectedCouponId === ''
                                                    ? 'border-gray-400 bg-gray-50 dark:bg-gray-700 dark:border-gray-500'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCouponId === ''
                                                        ? 'border-gray-600 bg-gray-600 dark:border-gray-400 dark:bg-gray-400'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        }`}>
                                                        {selectedCouponId === '' && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                                <circle cx="6" cy="6" r="3" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">No coupon</span>
                                                </div>
                                            </div>

                                            {/* Coupon cards */}
                                            {userCoupons.map((c) => {
                                                const couponCategoryId = c.category_id;
                                                let isCategoryMatch = true;

                                                if (couponCategoryId !== null && couponCategoryId !== undefined && couponCategoryId !== '') {
                                                    isCategoryMatch = cartItems.some(item => {
                                                        const itemCategoryId = item.product?.category_id;
                                                        const itemParentCategoryId = item.product?.category?.parent_category_id;
                                                        const directMatch = String(itemCategoryId) === String(couponCategoryId);
                                                        const parentMatch = itemParentCategoryId && String(itemParentCategoryId) === String(couponCategoryId);
                                                        return directMatch || parentMatch;
                                                    });
                                                }

                                                const isSelected = String(selectedCouponId) === String(c.id ?? c.coupon_id);
                                                const isPercentage = c.type === 'percentage';
                                                const discountValue = isPercentage ? `${c.value}%` : `฿${Number(c.value).toLocaleString()}`;

                                                return (
                                                    <div
                                                        key={c.id ?? c.coupon_id}
                                                        onClick={() => {
                                                            if (isCategoryMatch) {
                                                                const couponId = c.id ?? c.coupon_id;
                                                                setSelectedCouponId(couponId);
                                                                applyCoupon(couponId);
                                                            }
                                                        }}
                                                        className={`relative rounded-lg border-2 p-3 transition-all duration-200 ${!isCategoryMatch
                                                            ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm cursor-pointer'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm bg-white dark:bg-gray-800 cursor-pointer'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Radio button */}
                                                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${!isCategoryMatch
                                                                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                                                                : isSelected
                                                                    ? 'border-indigo-600 bg-indigo-600'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                                        <circle cx="6" cy="6" r="3" />
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            {/* Coupon info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm font-bold font-mono ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
                                                                                }`}>
                                                                                {c.code}
                                                                            </span>
                                                                            {!isCategoryMatch && (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                                                    Not applicable
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">{c.name}</p>
                                                                    </div>

                                                                    {/* Discount badge */}
                                                                    <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-bold ${isSelected
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                        {discountValue} OFF
                                                                    </div>
                                                                </div>

                                                                {/* Min order amount */}
                                                                {c.min_order_amount && (
                                                                    <div className="flex items-center gap-1 mt-1.5">
                                                                        <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                                        </svg>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Min order: ฿{Number(c.min_order_amount).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Selected indicator */}
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                            <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">No coupons available</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Claim coupons on the Coupons page to use them here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}