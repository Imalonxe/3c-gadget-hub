import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function About() {
    return (
        <MainLayout>
            <Head title="เกี่ยวกับเรา (About)" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 transition-colors duration-300">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 dark:border-gray-700">เกี่ยวกับ 3C Gadget Hub</h1>

                        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p className="text-lg font-light">
                                <span className="font-semibold text-gray-900 dark:text-white">3C Gadget Hub</span> คือแพลตฟอร์มจำหน่ายอุปกรณ์ไอทีที่ผสานมาตรฐานอีคอมเมิร์ซระดับมืออาชีพเข้ากับนวัตกรรม Gamification เรามุ่งเน้นการสร้างประสบการณ์การใช้งานที่ราบรื่น ทันสมัย และคุ้มค่าสูงสุดสำหรับผู้ใช้งานทุกคน
                            </p>

                            <div className="border-l-4 border-indigo-500 pl-6 py-2 bg-gray-50 dark:bg-gray-800/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Philosophy: Shop & Play</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    เราเชื่อว่าการเลือกซื้ออุปกรณ์ไอทีคือการลงทุนเพื่อยกระดับไลฟ์สไตล์ เราจึงออกแบบระบบที่ตอบโจทย์ทั้งความรวดเร็วในการสั่งซื้อ และความสนุกสนานจากการสะสมความสำเร็จ
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                                        Synergy Loadout System
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ยกระดับการจัดสเปคคอมพิวเตอร์ด้วยระบบจัดเซตอัจฉริยะ เลือกซื้อสินค้าตาม Mission ที่กำหนดเพื่อรับส่วนลดพิเศษและโบนัส XP สูงสุด ออกแบบมาเพื่อความคุ้มค่าที่เหนือกว่าการซื้อแยกชิ้น
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                                        Progression System
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ทุกยอดการใช้จ่ายและการมีส่วนร่วมจะถูกเปลี่ยนเป็นค่าประสบการณ์ (XP) เพื่อเลื่อนระดับสมาชิก ปลดล็อคสิทธิประโยชน์ระดับ VIP เช่น ส่วนลดถาวรและสิทธิ์การส่งฟรี
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Our Commitment</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    เรามุ่งมั่นคัดสรรเฉพาะสินค้าคุณภาพสูงจากแบรนด์ชั้นนำ พร้อมการรับประกันและการบริการหลังการขายที่เชื่อถือได้ เพื่อให้ 3C Gadget Hub เป็นจุดหมายปลายทางที่ครบครันที่สุดสำหรับคนรักเทคโนโลยี
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-12 text-center">
                            © 2025 3C Gadget Hub. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
