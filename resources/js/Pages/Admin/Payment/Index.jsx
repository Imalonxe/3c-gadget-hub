import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index() {
    const { props } = usePage();
    const initial = props.props || {};
    const [phone, setPhone] = useState(initial.promptpay_phone || '');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post(route('admin.payment.update'), { promptpay_phone: phone }).then(() => setSaving(false)).catch(() => setSaving(false));
    };

    return (
        <AdminLayout>
            <Head title="Payment Settings" />

            <div className="p-6 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">PromptPay Settings</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PromptPay Phone or ID</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1 block w-full border rounded p-2"
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(phone || '');
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1500);
                                    } catch (err) {
                                        // Fallback: select input and copy
                                        const el = document.createElement('textarea');
                                        el.value = phone || '';
                                        document.body.appendChild(el);
                                        el.select();
                                        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {}
                                        document.body.removeChild(el);
                                    }
                                }}
                                className="px-3 py-2 bg-gray-200 text-gray-800 rounded border"
                            >
                                Copy
                            </button>
                            {copied && <span className="text-sm text-green-600">Copied!</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter the numeric PromptPay phone number or PromptPay ID (only digits will be saved).</p>
                    </div>

                    <div>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
