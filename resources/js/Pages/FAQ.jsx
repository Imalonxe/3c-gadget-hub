import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function FAQ() {
    return (
        <MainLayout>
            <Head title="คำถามที่พบบ่อย (FAQ)" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">คำถามที่พบบ่อย (FAQ)</h1>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. การสั่งซื้อทำอย่างไร?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">เลือกสินค้าที่ต้องการกด "Add to Cart" หรือ "Buy Now" แล้วทำตามขั้นตอนที่อยู่ในตะกร้าเพื่อชำระเงิน</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. ช่องทางการชำระเงินมีอะไรบ้าง?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">เรารองรับการชำระผ่านบัตรเครดิต/เดบิต, พร้อมเพย์ และการโอนผ่านธนาคาร (ขึ้นอยู่กับการตั้งค่าของผู้ให้บริการการชำระเงินที่เปิดใช้งาน)</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. สามารถคืนสินค้าหรือเปลี่ยนสินค้าได้หรือไม่?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">นโยบายการคืนสินค้าขึ้นอยู่กับประเภทสินค้าและเงื่อนไขที่ระบุในหน้ารายละเอียดสินค้า โปรดติดต่อฝ่ายบริการลูกค้าพร้อมแจ้งหมายเลขคำสั่งซื้อเพื่อดำเนินการ</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. จะติดตามสถานะการจัดส่งได้อย่างไร?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">หลังการจัดส่ง เราจะแจ้งหมายเลขติดตามพัสดุในหน้ารายการสั่งซื้อหรือทางอีเมลที่ให้ไว้</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. ต้องการความช่วยเหลือเพิ่มเติมจะติดต่อได้อย่างไร?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">กรุณาติดต่อฝ่ายบริการลูกค้าผ่านแบบฟอร์มติดต่อหรืออีเมลที่ระบุในหน้าเว็บไซต์ เราจะตอบกลับโดยเร็วที่สุด</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. ข้อมูลส่วนบุคคลจะถูกเก็บอย่างไร?</h2>
                                <p className="mb-2 text-gray-700 dark:text-gray-300">เราเก็บข้อมูลตามนโยบายความเป็นส่วนตัวของเรา อ่านรายละเอียดเพิ่มเติมได้ที่หน้านโยบายความเป็นส่วนตัว</p>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">อัพเดตล่าสุด: 29 ตุลาคม 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
