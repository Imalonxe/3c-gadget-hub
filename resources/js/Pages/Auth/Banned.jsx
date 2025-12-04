import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';

export default function Banned() {
    const { auth } = usePage().props;
    const user = auth.user;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <>
            <Head title="บัญชีถูกระงับ" />
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">บัญชีถูกระงับ</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            ขออภัย คุณไม่สามารถเข้าใช้งานระบบได้ในขณะนี้
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="border-t border-b border-gray-200 py-4">
                            <div className="flex justify-between py-2">
                                <span className="text-sm font-medium text-gray-500">เหตุผล</span>
                                <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">
                                    {user?.ban_reason || 'ไม่ระบุเหตุผล'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm font-medium text-gray-500">ระงับถึงวันที่</span>
                                <span className="text-sm text-gray-900 text-right">
                                    {user?.banned_until ? new Date(user.banned_until).toLocaleString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'UTC'
                                    }) : 'ไม่มีกำหนด'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                            <p>
                                หากคุณคิดว่านี่เป็นข้อผิดพลาด หรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
