import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';

export default function CouponInput({ onApply, subtotal, categoryId = null }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    const { data, setData, reset } = useForm({
        code: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(route('coupons.validate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    code: data.code,
                    subtotal,
                    category_id: categoryId,
                }),
            });

            const result = await response.json();

            if (result.valid) {
                setMessageType('success');
                setMessage(result.message);
                // Pass the full result and the code back to the caller so the
                // parent can react to free_shipping and other flags.
                onApply(result, data.code);
                reset();
            } else {
                setMessageType('error');
                setMessage(result.message);
            }
        } catch (error) {
            setMessageType('error');
            setMessage('An error occurred while validating the coupon.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <form onSubmit={handleSubmit} className="flex items-start space-x-2">
                <div className="flex-grow">
                    <TextInput
                        type="text"
                        placeholder="Enter coupon code"
                        className="w-full"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        disabled={loading}
                    />
                    {message && (
                        <p className={`mt-1 text-sm ${
                            messageType === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {message}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading || !data.code}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Applying...' : 'Apply'}
                </button>
            </form>
        </div>
    );
}