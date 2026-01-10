# 3C Gadget Hub

แพลตฟอร์ม E-commerce สำหรับจำหน่ายอุปกรณ์ไอที 3C (Computer, Communication, Consumer Electronics) ผสมผสานความสนุกด้วยระบบ Gamification และฟีเจอร์จัดชุดคอมพิวเตอร์ Synergy Loadout

## Key Features
- **Synergy Loadout:** ระบบจัดชุดคอมพิวเตอร์ตามเงื่อนไขหมวดหมู่ที่กำหนด (Synergy) เพื่อรับโบนัสพิเศษ ช่วยกระตุ้นยอดขายต่อบิล
- **Gamification:** สะสม XP เลเวลอัพ จากการซื้อและทำกิจกรรม เพื่อรับสิทธิพิเศษ
- **Product Catalog:** ค้นหาสินค้าละเอียด กรองตามสเปคและแบรนด์
- **Smart Cart & Checkout:** ตะกร้าสินค้า และระบบชำระเงินที่รองรับส่วนลด
- **Authentication:** ระบบสมาชิก และจัดการโปรไฟล์

## Tech Stack
- **Backend:** Laravel Framework
- **Frontend:** React (Inertia.js), Tailwind CSS
- **Database:** MySQL

## Installation

1. **ติดตั้ง Dependencies**
   ```bash
   composer install
   npm install && npm run build
   ```

2. **ตั้งค่า Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *อย่าลืมตั้งค่า DB ใน .env*

3. **เตรียมฐานข้อมูล**
   ```bash
   php artisan migrate --seed
   ```

4. **เริ่มระบบ**
   ```bash
   php artisan serve
   ```

---
Developed by นาย คุณานนต์ ปัทมาภา
