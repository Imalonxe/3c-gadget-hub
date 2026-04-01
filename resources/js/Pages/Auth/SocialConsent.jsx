import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function SocialConsent({ provider }) {
    const { data, setData, post, processing, errors } = useForm({ agreed: '' });
    const [agreed, setAgreed] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (!agreed) return;
        // Laravel 'accepted' rule expects 'yes', 'on', '1' or true (avoid sending string 'true')
        setData('agreed', '1');
        post(route('social.consent.confirm', { provider }));
    };

    return (
        <MainLayout>
            <Head title="ยืนยันข้อตกลงก่อนเข้าสู่ระบบ" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ยืนยันข้อตกลง</h1>

                        <p className="mb-4 text-gray-700 dark:text-gray-300">ก่อนที่เราจะสร้างบัญชีจากข้อมูล {provider} โปรดอ่านและยินยอมต่อ <Link href={route('terms')} className="text-blue-600 dark:text-blue-400 underline">Terms & Conditions</Link> และ <Link href={route('privacy')} className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</Link>.</p>

                        <form onSubmit={submit}>
                            <div className="flex items-start gap-3 mb-4">
                                <input id="agree" name="agreed" type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setData('agreed', e.target.checked ? '1' : ''); }} className="mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700" />
                                <label htmlFor="agree" className="text-sm text-gray-700 dark:text-gray-300">ฉันได้อ่านและยินยอมต่อ <Link href={route('terms')} className="text-blue-600 dark:text-blue-400 underline">Terms & Conditions</Link> และ <Link href={route('privacy')} className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</Link></label>
                            </div>

                            {errors.agreed && <div className="text-sm text-red-600 mb-2">{errors.agreed}</div>}

                            <div className="flex justify-end gap-3">
                                <Link href={route('login')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">ยกเลิก</Link>
                                <button type="submit" disabled={!agreed || processing} className={`px-4 py-2 rounded-md text-white ${(!agreed || processing) ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}>
                                    {processing ? 'กำลังดำเนินการ...' : 'ยืนยันและสร้างบัญชี'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
