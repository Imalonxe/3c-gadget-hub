import AdminLayout from '@/Layouts/AdminLayout';
import CouponForm from './Form';

export default function Create({ categories }) {
    return (
        <CouponForm categories={categories} />
    );
}

Create.layout = page => <AdminLayout children={page} title="Create Coupon" />;