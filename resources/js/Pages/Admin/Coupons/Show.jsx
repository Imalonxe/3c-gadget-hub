import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import CouponAnalytics from '@/Components/CouponAnalytics';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function Show({ coupon, claims = [] }) {
    return (
        <AdminLayout title={`Coupon: ${coupon.code}`}>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{coupon.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">Code: {coupon.code}</p>
                        </div>
                        <Link
                            href={route('admin.coupons.edit', coupon.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                        >
                            Edit Coupon
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Coupon Details
                            </h3>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {coupon.type === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Value</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {coupon.type === 'fixed' 
                                            ? formatCurrency(coupon.value)
                                            : `${coupon.value}%`
                                        }
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Minimum Order Amount</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {formatCurrency(coupon.min_order_amount)}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {coupon.category ? coupon.category.name : 'All Categories'}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                coupon.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Valid Period</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {coupon.starts_at && (
                                            <span>From {formatDate(coupon.starts_at)} </span>
                                        )}
                                        {coupon.expires_at && (
                                            <span>until {formatDate(coupon.expires_at)}</span>
                                        )}
                                        {!coupon.starts_at && !coupon.expires_at && 'No time restriction'}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Usage Limit</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {coupon.max_uses 
                                            ? `${coupon.used_count} of ${coupon.max_uses} used`
                                            : 'Unlimited'
                                        }
                                    </dd>
                                </div>
                                {coupon.description && (
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {coupon.description}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    <CouponAnalytics coupon={coupon} />

                    <div className="mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Claims</h3>
                                <p className="mt-1 text-sm text-gray-500">Users who have claimed or been attached to this coupon.</p>
                            </div>
                            <div className="border-t border-gray-200">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">#</th>
                                                    <th className="px-4 py-2 text-left">User</th>
                                                    <th className="px-4 py-2 text-left">Email</th>
                                                    <th className="px-4 py-2 text-left">Claimed At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {claims.length === 0 ? (
                                                    <tr><td className="px-4 py-3" colSpan={4}>No claims yet.</td></tr>
                                                ) : (
                                                    claims.map((c, idx) => (
                                                        <tr key={c.id} className="border-t">
                                                            <td className="px-4 py-3">{idx + 1}</td>
                                                            <td className="px-4 py-3">{c.name}</td>
                                                            <td className="px-4 py-3">{c.email || '-'}</td>
                                                            <td className="px-4 py-3">{c.claimed_at ? formatDate(c.claimed_at) : '-'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}