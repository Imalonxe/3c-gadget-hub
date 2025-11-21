import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ order }) {
    const { data, setData, put, processing, errors } = useForm({
        status: order.status || '',
        payment_status: order.payment_status || '',
        shipping_method: order.shipping_method || '',
        shipping_fee: order.shipping_fee || 0,
        tracking_number: order.tracking_number || '',
        notes: order.notes || ''
    });

    const [message, setMessage] = React.useState(null);

    const submit = (e) => {
        e.preventDefault();
        setMessage(null);
        console.log('Submitting order update', data);
        put(route('admin.orders.update', order.order_id), {
            onSuccess: (page) => {
                console.log('Update success', page);
                setMessage({ type: 'success', text: 'Order saved.' });
            },
            onError: (errs) => {
                console.log('Update validation errors', errs);
                setMessage({ type: 'error', text: 'There were validation errors. Please check the form.' });
            },
            onFinish: () => {
                // ensure processing state handled by useForm; scroll to top where message may be
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    return (
        <AdminLayout title={`Edit Order ${order.order_number}`}>
            <Head title={`Edit ${order.order_number}`} />

            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Edit Order</h2>

                    <form onSubmit={submit} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded mb-2 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Order Number</label>
                            <div className="mt-1">{order.order_number}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-48 rounded-md border-gray-300">
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className="mt-1 block w-48 rounded-md border-gray-300">
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shipping Fee</label>
                                <input type="number" step="0.01" value={data.shipping_fee} onChange={e => setData('shipping_fee', e.target.value)} className="mt-1 block w-48 rounded-md border-gray-300" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shipping Method</label>
                            <input type="text" value={data.shipping_method} onChange={e => setData('shipping_method', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                            <input type="text" value={data.tracking_number} onChange={e => setData('tracking_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" rows={4} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
                            <Link href={route('admin.orders.index')} className="text-sm text-gray-600">Back to list</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
