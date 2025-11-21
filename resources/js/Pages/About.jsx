import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function About() {
    return (
        <MainLayout>
            <Head title="เกี่ยวกับเรา (About)" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">เกี่ยวกับเรา</h1>

                        <p className="mb-4 text-gray-700">3C Gadget Hub ก่อตั้งขึ้นด้วยเป้าหมายที่จะนำเสนอแกดเจ็ตและอุปกรณ์อิเล็กทรอนิกส์คุณภาพสูงในราคาที่เข้าถึงได้ เราเชื่อว่าการเลือกซื้อสินค้าเทคโนโลยีควรเป็นเรื่องง่าย ปลอดภัย และให้ความคุ้มค่าสูงสุดแก่ลูกค้า</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2">พันธกิจของเรา</h2>
                        <ul className="list-disc list-inside mb-4 text-gray-700">
                            <li>คัดสรรสินค้าที่มีคุณภาพและมาตรฐาน</li>
                            <li>ให้บริการลูกค้าด้วยความจริงใจและรวดเร็ว</li>
                            <li>สร้างประสบการณ์การช็อปปิ้งออนไลน์ที่ปลอดภัยและสะดวกสบาย</li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-6 mb-2">ติดต่อเรา</h2>
                        <p className="mb-2 text-gray-700">หากคุณมีข้อสงสัยเกี่ยวกับสินค้า คำสั่งซื้อ หรือบริการหลังการขาย โปรดติดต่อเราผ่านหน้าติดต่อ (Contact) หรือตรวจสอบข้อมูลในหน้าช่วยเหลือ/FAQ</p>

                        <p className="text-sm text-gray-500 mt-6">อัพเดตล่าสุด: 4 พฤศจิกายน 2025</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
