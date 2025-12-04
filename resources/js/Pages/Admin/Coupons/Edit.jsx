import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ coupon, categories }) {
    return (
        <CouponForm
            coupon={coupon}
            categories={categories}
        />
    );
}

Edit.layout = page => <AdminLayout children={page} title="Edit Coupon" />;