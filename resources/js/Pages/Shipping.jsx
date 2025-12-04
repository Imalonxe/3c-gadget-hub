import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Shipping() {
    return (
        <MainLayout>
            <Head title="การจัดส่ง (Shipping)" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">การจัดส่ง</h1>

                        <p className="mb-4 text-gray-700 dark:text-gray-300">เรามุ่งมั่นให้การจัดส่งรวดเร็วและปลอดภัย โดยมีรายละเอียดการจัดส่งทั่วไปดังนี้:</p>

                        <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">ระยะเวลาในการจัดส่ง</h2>
                        <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">
                            <li>พื้นที่ในประเทศ: โดยทั่วไป 2–7 วันทำการ ขึ้นอยู่กับปลายทางและผู้ให้บริการขนส่ง</li>
                            <li>วันหยุดและกิจกรรมพิเศษอาจทำให้ระยะเวลานานขึ้น</li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">ค่าจัดส่ง</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">ค่าจัดส่งขึ้นอยู่กับน้ำหนัก/ขนาดสินค้าและปลายทาง ระบบจะคำนวณค่าส่งในหน้าตะกร้าก่อนยืนยันการสั่งซื้อ หากมีโปรโมชั่นค่าส่ง เราจะแสดงส่วนลดในขั้นตอนการชำระเงิน</p>

                        <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">การติดตามพัสดุ</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">หลังจากจัดส่ง เราจะส่งหมายเลขติดตามพัสดุไปที่อีเมลหรือแสดงในหน้ารายการสั่งซื้อ คุณสามารถคลิกหมายเลขติดตามเพื่อดูสถานะล่าสุดได้ที่เว็บไซต์ผู้ให้บริการขนส่ง</p>

                        <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">การคืน/เปลี่ยนสินค้า</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">นโยบายการคืนสินค้าอาจแตกต่างตามประเภทสินค้า กรุณาตรวจสอบนโยบายการคืนสินค้าในหน้ารายละเอียดสินค้า หรือ ติดต่อฝ่ายบริการลูกค้า เพื่อขอคำแนะนำในการส่งคืนสินค้า</p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">หากต้องการความช่วยเหลือเพิ่มเติม โปรดติดต่อฝ่ายบริการลูกค้าของเรา</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">อัพเดตล่าสุด: 4 พฤศจิกายน 2025</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
