import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Terms() {
    return (
        <MainLayout>
            <Head title="ข้อกำหนดและเงื่อนไข" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">ข้อกำหนดและเงื่อนไขการใช้บริการ</h1>

                        <p className="mb-4">ยินดีต้อนรับสู่ 3C Gadget Hub: กรุณาอ่านข้อกำหนดและเงื่อนไขต่อไปนี้อย่างละเอียดก่อนใช้บริการ เมื่อคุณเข้าใช้งานเว็บไซต์นี้ ถือว่าคุณยอมรับข้อกำหนดเหล่านี้</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2">การสั่งซื้อ</h2>
                        <p className="mb-4">การสั่งซื้อสินค้าทางเว็บไซต์ถือเป็นข้อตกลงในการซื้อระหว่างคุณและผู้ให้บริการ ราคาที่แสดงรวมภาษี (หากมี) และอาจมีค่าจัดส่งเพิ่มเติม การยืนยันคำสั่งซื้อจะส่งไปหาอีเมลที่คุณลงทะเบียนไว้</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2">การชำระเงิน</h2>
                        <p className="mb-4">เรารองรับช่องทางการชำระเงินหลายรูปแบบ โดยบางช่องทางอาจมีนโยบายและค่าธรรมเนียมแยกต่างหาก ข้อมูลการชำระเงินบางส่วนจะถูกจัดการโดยผู้ให้บริการภายนอกตามมาตรฐานความปลอดภัย</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2">การคืนสินค้าและการรับประกัน</h2>
                        <p className="mb-4">นโยบายการคืนสินค้าและการรับประกันจะแตกต่างกันไปตามประเภทสินค้า กรุณาตรวจสอบหน้ารายละเอียดสินค้าและนโยบายการรับประกันก่อนการสั่งซื้อ หากต้องการคืนสินค้า กรุณาติดต่อทีมสนับสนุนภายในระยะเวลาที่กำหนด</p>

                        <h2 className="text-lg font-semibold mt-6 mb-2">ข้อกำหนดทั่วไป</h2>
                        <p className="mb-4">เราสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขนี้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า การเปลี่ยนแปลงจะมีผลทันทีเมื่อประกาศในเว็บไซต์</p>

                        <p className="text-sm text-gray-500 mt-6">อัพเดตล่าสุด: 28 ตุลาคม 2025</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
