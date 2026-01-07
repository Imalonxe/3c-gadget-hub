# 3C Gadget Hub

แพลตฟอร์ม E-commerce สำหรับจำหน่ายสินค้าไอทีและแกดเจ็ตที่ทันสมัย พัฒนาด้วย Laravel Framework โดยมุ่งเน้นประสิทธิภาพ ความปลอดภัย และประสบการณ์ผู้ใช้ที่ดีเยี่ยม พร้อมฟีเจอร์ Gamification ที่ทำให้การช้อปปิ้งสนุกยิ่งขึ้น

## เทคโนโลยีที่ใช้
- **Backend:** Laravel Framework
- **Database:** MySQL
- **Frontend:** Blade Templates, JavaScript, CSS
- **Environment:** PHP 8.2+

## การติดตั้งและเริ่มต้นใช้งาน (Installation)

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
   *อย่าลืมตั้งค่า Database ในไฟล์ `.env` ให้ถูกต้อง*

3. **เตรียมฐานข้อมูล**
   ```bash
   php artisan migrate --seed
   ```

4. **เริ่มการทำงาน**
   ```bash
   php artisan serve
   ```

## ฟีเจอร์หลัก
- **Synergy Loadout:** ระบบจำลองการจัดสเปคคอมพิวเตอร์และตรวจสอบความเข้ากันได้ของอุปกรณ์
- **Gamification System:** ระบบสะสมแต้มและเก็บเลเวลจากการใช้งาน เพื่อแลกรับสิทธิพิเศษ
- **Product Catalog & Search:** ระบบแสดงรายการสินค้าและค้นหาที่รวดเร็ว
- **Cart & Checkout:** ระบบตะกร้าสินค้าและการชำระเงินที่ปลอดภัย
- **Authentication:** ระบบสมาชิกและสิทธิ์การใช้งานที่ครอบคลุม
- **Responsive Design:** รองรับการใช้งานผ่านมือถือแท็บเล็ตและคอมพิวเตอร์

---
Developed by นาย คุณานนต์ ปัทมาภา
