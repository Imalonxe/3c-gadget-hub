import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Privacy() {
    return (
        <MainLayout>
            <Head title="นโยบายความเป็นส่วนตัว" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">นโยบายความเป็นส่วนตัว</h1>

                        <p className="mb-4 text-gray-700 dark:text-gray-300">ที่ 3C Gadget Hub เราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้ทุกท่าน ข้อมูลส่วนบุคคลที่คุณให้แก่เราจะถูกเก็บรักษาและใช้งานตามวัตถุประสงค์ที่ชัดเจน เช่น การดำเนินการสั่งซื้อ การติดต่อเพื่อบริการลูกค้า และการปรับปรุงบริการของเรา</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">การเก็บรวบรวมข้อมูล</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">เราอาจเก็บข้อมูล เช่น ชื่อ-นามสกุล ที่อยู่อีเมล ที่อยู่จัดส่ง หมายเลขโทรศัพท์ และข้อมูลการชำระเงิน (ซึ่งจะถูกจัดการโดยผู้ให้บริการการชำระเงินภายนอก) เมื่อคุณลงทะเบียน สั่งซื้อ หรือใช้ฟีเจอร์ต่าง ๆ บนเว็บไซต์</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">การใช้งานข้อมูล</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">ข้อมูลที่เก็บรวบรวมจะถูกใช้งานเพื่อประมวลผลคำสั่งซื้อ ให้บริการหลังการขาย แจ้งสถานะการจัดส่ง ส่งการแจ้งเตือนที่เกี่ยวข้อง และปรับปรุงประสบการณ์การใช้งานบนเว็บไซต์</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">การเปิดเผยข้อมูล</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอกเพื่อวัตถุประสงค์ทางการตลาดโดยตรงโดยไม่ได้รับความยินยอม อย่างไรก็ตาม ข้อมูลอาจถูกเปิดเผยต่อผู้ให้บริการที่จำเป็น เช่น ผู้ให้บริการจัดส่ง ผู้ให้บริการชำระเงิน หรือผู้ให้บริการระบบ เพื่อให้บริการที่คุณร้องขอ</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">สิทธิของคุณ</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">คุณมีสิทธิในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณตามที่กฎหมายที่เกี่ยวข้องอนุญาต หากต้องการขอให้ลบหรือแก้ไขข้อมูล กรุณาติดต่อทีมสนับสนุนลูกค้าของเรา</p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">อัพเดตล่าสุด: 28 ตุลาคม 2025</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
