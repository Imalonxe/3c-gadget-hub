import CouponForm from './Form';

export default function Edit({ coupon, categories }) {
    return (
        <CouponForm 
            coupon={coupon} 
            categories={categories} 
        />
    );
}