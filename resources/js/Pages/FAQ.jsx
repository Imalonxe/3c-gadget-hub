import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function FAQ() {
    return (
        <MainLayout>
            <Head title="คำถามที่พบบ่อย (FAQ)" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">คำถามที่พบบ่อย (FAQ)</h1>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold">1. การสั่งซื้อทำอย่างไร?</h2>
                                <p className="mb-2">เลือกสินค้าที่ต้องการกด "Add to Cart" หรือ "Buy Now" แล้วทำตามขั้นตอนที่อยู่ในตะกร้าเพื่อชำระเงิน</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">2. ช่องทางการชำระเงินมีอะไรบ้าง?</h2>
                                <p className="mb-2">เรารองรับการชำระผ่านบัตรเครดิต/เดบิต, พร้อมเพย์ และการโอนผ่านธนาคาร (ขึ้นอยู่กับการตั้งค่าของผู้ให้บริการการชำระเงินที่เปิดใช้งาน)</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">3. สามารถคืนสินค้าหรือเปลี่ยนสินค้าได้หรือไม่?</h2>
                                <p className="mb-2">นโยบายการคืนสินค้าขึ้นอยู่กับประเภทสินค้าและเงื่อนไขที่ระบุในหน้ารายละเอียดสินค้า โปรดติดต่อฝ่ายบริการลูกค้าพร้อมแจ้งหมายเลขคำสั่งซื้อเพื่อดำเนินการ</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">4. จะติดตามสถานะการจัดส่งได้อย่างไร?</h2>
                                <p className="mb-2">หลังการจัดส่ง เราจะแจ้งหมายเลขติดตามพัสดุในหน้ารายการสั่งซื้อหรือทางอีเมลที่ให้ไว้</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">5. ต้องการความช่วยเหลือเพิ่มเติมจะติดต่อได้อย่างไร?</h2>
                                <p className="mb-2">กรุณาติดต่อฝ่ายบริการลูกค้าผ่านแบบฟอร์มติดต่อหรืออีเมลที่ระบุในหน้าเว็บไซต์ เราจะตอบกลับโดยเร็วที่สุด</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">6. ข้อมูลส่วนบุคคลจะถูกเก็บอย่างไร?</h2>
                                <p className="mb-2">เราเก็บข้อมูลตามนโยบายความเป็นส่วนตัวของเรา อ่านรายละเอียดเพิ่มเติมได้ที่หน้านโยบายความเป็นส่วนตัว</p>
                            </div>

                            <p className="text-sm text-gray-500 mt-6">อัพเดตล่าสุด: 29 ตุลาคม 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
