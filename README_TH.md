    # 📱 3C Gadget Hub - ระบบขายอุปกรณ์อิเล็กทรอนิกส์ออนไลน์

ยินดีต้อนรับเข้าสู่ระบบ **3C Gadget Hub** - แพลตฟอร์มอีคอมเมิร์ซสมัยใหม่สำหรับการขายอุปกรณ์คอมพิวเตอร์ การสื่อสาร และอุปกรณ์อิเล็กทรอนิกส์ที่มีชุมชนผู้ใช้ที่กระตือรือร้น

---

## 🎯 ภาพรวมของโปรเจค

3C Gadget Hub เป็นแพลตฟอร์มเชื่อมต่อผู้ซื้อและผู้ขาย โดยมีฟีเจอร์ครบครัน ตั้งแต่การค้นหาสินค้า การจัดการตะกร้าสินค้า ระบบการชำระเงิน ไปถึงชุมชนสำหรับถามและตอบคำถาม พร้อมระบบจัดการแอดมินอันทรงพลัง

**สแต็คเทคโนโลยี:**
- **Backend:** Laravel 11 (PHP Framework)
- **Frontend:** React 18 + Inertia.js
- **Database:** MySQL
- **Build Tool:** Vite
- **CSS Framework:** Tailwind CSS
- **Real-time:** Laravel Echo + Pusher
- **Payment:** Stripe + PromptPay
- **Security:** Google reCAPTCHA v2, OAuth Google

---

## ⭐ ฟีเจอร์หลัก

### 1. **ระบบผู้ใช้ (User Management)**
- ✅ สมัครสมาชิก (Register) พร้อมยืนยันอีเมล
- ✅ เข้าสู่ระบบ (Login) พร้อม reCAPTCHA v2
- ✅ เข้าสู่ระบบด้วย Google (OAuth)
- ✅ ลืมรหัสผ่าน (Forgot Password)
- ✅ ตั้งค่าโปรไฟล์ส่วนตัว
- ✅ ลบบัญชี (Account Deletion)
- ✅ ระบบจัดเก็บที่อยู่จัดส่ง (Multiple Addresses)

**ความปลอดภัย:**
- Google reCAPTCHA v2 บนหน้า Login และ Register
- Email verification ก่อนใช้งาน
- Password hashing ด้วย bcrypt
- Session management

---

### 2. **ระบบสินค้า (Product Management)**

#### หน้าผู้ซื้อ:
- ✅ แสดงสินค้าแนะนำ (Featured Products) บนหน้าแรก
- ✅ ค้นหาและกรองสินค้าตามหมวดหมู่
- ✅ ดูรายละเอียดสินค้า (ราคา ภาพ คำอธิบาย)
- ✅ ระบบรีวิวและให้คะแนนสินค้า (1-5 ดาว)
- ✅ ดูความคิดเห็นจากผู้อื่น

#### หน้าแอดมิน:
- ✅ เพิ่ม/แก้ไข/ลบสินค้า
- ✅ อัปโหลดรูปภาพ (multiple images)
- ✅ จัดการคุณสมบัติสินค้า (Attributes)
- ✅ ตั้งค่าราคา สต็อก
- ✅ เปิด/ปิดสินค้า (Toggle Active)
- ✅ เปิด/ปิดสินค้าแนะนำ (Toggle Featured)
- ✅ ลำดับการแสดงผล

---

### 3. **ระบบตะกร้าและชำระเงิน (Cart & Checkout)**

#### ตะกร้าสินค้า:
- ✅ เพิ่ม/ลบ/แก้ไขจำนวนสินค้า
- ✅ แสดงราคารวม พร้อมโปรโมชั่น

#### การชำระเงิน:
- ✅ เลือกที่อยู่จัดส่ง
- ✅ ใส่ข้อมูลผู้ติดต่อ
- ✅ ตรวจสอบใบเสร็จ
- ✅ เลือกวิธีชำระเงิน

---

### 4. **ระบบการชำระเงิน (Payment System)**

#### วิธีชำระเงิน:
- ✅ **Stripe** - บัตรเครดิต/เดบิต (Online)
- ✅ **PromptPay** - ระบบจ่ายเงินดิจิทัล (Manual Upload)
- ✅ **Bank Transfer** - โอนเงินผ่านธนาคาร

#### สถานะการชำระเงิน:
- ⏳ รอการตรวจสอบ (Pending)
- ✅ ชำระเงินแล้ว (Paid)
- ❌ ล้มเหลว (Failed)

#### OMT Payment Integration:
- ✅ สนับสนุน Stripe Webhook สำหรับการชำระเงินอัตโนมัติ
- ✅ Slip verification ผ่าน SlipOK API
- ✅ PromptPay QR Code generation

---

### 5. **ระบบสั่งซื้อ (Order Management)**

#### หน้าผู้ซื้อ:
- ✅ ดูประวัติการสั่งซื้อ
- ✅ ดูรายละเอียดสั่งซื้อ
- ✅ ยกเลิกการสั่งซื้อ (ตามเงื่อนไข)
- ✅ ติดตามสถานะ (tracking)
- ✅ ดาวน์โหลดใบเสร็จ PDF

#### หน้าแอดมิน:
- ✅ ดูรายการสั่งซื้อทั้งหมด
- ✅ แก้ไขสถานะการสั่งซื้อ
- ✅ อัปเดตข้อมูลการจัดส่ง (tracking number, shipping date)
- ✅ ส่งออกใบเสร็จ PDF
- ✅ ค้นหา/กรองสั่งซื้อ

**สถานะสั่งซื้อ:**
- 📋 Pending (รอการยืนยัน)
- 📦 Processing (กำลังเตรียม)
- 🚚 Shipped (ส่งไปแล้ว)
- ✅ Delivered (ส่งถึงแล้ว)
- ❌ Cancelled (ยกเลิก)
- 🔄 Returned (คืนสินค้า)

---

### 6. **ระบบคูปอง (Coupon System)**

#### หน้าผู้ซื้อ:
- ✅ ดูคูปองที่พร้อมใช้
- ✅ ใส่โค้ดคูปอง
- ✅ ตรวจสอบส่วนลด
- ✅ ติดตามคูปองที่จ่อ

#### หน้าแอดมิน:
- ✅ สร้างคูปอง (Coupon Code, Discount %, Max Uses)
- ✅ ตั้งวันหมดอายุ
- ✅ ตั้งเงื่อนไข (Minimum Order Value)
- ✅ แก้ไข/ลบคูปอง
- ✅ Bulk update/delete คูปอง

**ประเภทคูปอง:**
- 💰 Percentage Discount (ส่วนลดเป็นเปอร์เซ็นต์)
- 💵 Fixed Discount (ส่วนลดเป็นจำนวนเงินคงที่)

---

### 7. **ระบบสินค้าโปรด (Wishlist)**

- ✅ เพิ่ม/ลบสินค้าจากรายการสินค้าโปรด
- ✅ ดูรายการสินค้าโปรด
- ✅ ย้ายสินค้าโปรดไปตะกร้า
- ✅ ตรวจสอบราคาล่าสุด

---

### 8. **ชุมชน - ระบบถามตอบ (Community - Q&A)**

#### หน้าสาธารณะ:
- ✅ ดูคำถามทั่วไป (Public Questions)
- ✅ ค้นหาคำถามตามคีย์เวิร์ด
- ✅ ให้คะแนนคำถาม/คำตอบ (Upvote/Downvote)

#### หน้าสมาชิก:
- ✅ ถามคำถาม
- ✅ ตอบคำถามจากผู้อื่น
- ✅ แก้ไข/ลบคำถาม
- ✅ อัปโหลดรูปภาพประกอบคำถาม
- ✅ ยอมรับคำตอบที่ดีที่สุด (Accept Answer)

#### หน้าแอดมิน:
- ✅ ดูและจัดการคำถามทั้งหมด
- ✅ อนุมัติ/ปฏิเสธคำถาม
- ✅ ลบคำถาม/คำตอบ
- ✅ เปลี่ยนสถานะคำถาม

---

### 9. **ระบบแจ้งเตือน (Notification System)**

- ✅ แจ้งเตือนสถานะการสั่งซื้อ
- ✅ แจ้งเตือนการชำระเงิน
- ✅ แจ้งเตือนจากชุมชน (คำตอบใหม่)
- ✅ ดูประวัติแจ้งเตือน
- ✅ ทำเครื่องหมายว่าอ่านแล้ว

---

### 10. **หน้าแอดมิน (Admin Dashboard)**

#### สถิติและรายงาน:
- ✅ แสดงสถิติการขายรวม
- ✅ แสดงสินค้าขายดี (Top Products)
- ✅ แสดงชาร์ตสั่งซื้อรายเดือน
- ✅ ดาวน์โหลดรายงาน PDF

#### การจัดการผู้ใช้:
- ✅ ดูรายการผู้ใช้ทั้งหมด
- ✅ เปิด/ปิดบัญชีผู้ใช้
- ✅ ลบผู้ใช้
- ✅ ค้นหาผู้ใช้

#### การจัดการหมวดหมู่:
- ✅ สร้าง/แก้ไข/ลบหมวดหมู่
- ✅ อัปโหลดรูปประกอบหมวดหมู่
- ✅ เปลี่ยนลำดับหมวดหมู่
- ✅ เปิด/ปิดหมวดหมู่

#### ตั้งค่าชำระเงิน:
- ✅ ตั้งค่า PromptPay ID
- ✅ ตั้งค่า Stripe API Keys
- ✅ ตั้งค่า SlipOK API

---

### 11. **ระบบบันทึกกิจกรรม (Activity Logs)**

- ✅ บันทึกการ Login/Logout
- ✅ บันทึกการแก้ไขสินค้า
- ✅ บันทึกการสั่งซื้อ
- ✅ บันทึกการจัดการแอดมิน
- ✅ ตรวจจับกิจกรรม F12 (Developer Tools), Copy/Paste

---

### 12. **หน้าสถิติ**

- ✅ หน้า Privacy Policy
- ✅ หน้า Terms & Conditions
- ✅ หน้า FAQ
- ✅ หน้า Shipping Information
- ✅ หน้า About Us

---

## 🔐 ความปลอดภัย

### Authentication & Authorization:
- ✅ Email verification บนการสมัครสมาชิก
- ✅ Password reset dengan secure token
- ✅ Role-based access control (Admin/User)
- ✅ Middleware authorization บน protected routes

### Protection:
- ✅ Google reCAPTCHA v2 บน Login/Register
- ✅ CSRF token protection
- ✅ SQL Injection prevention (Eloquent ORM)
- ✅ XSS protection
- ✅ Activity logging สำหรับ sensitive actions

### Payment Security:
- ✅ SSL/HTTPS enforcement
- ✅ PCI-DSS compliance via Stripe
- ✅ SlipOK integration สำหรับ PromptPay verification

---

## 📊 Database Schema

### Core Tables:
- **users** - ข้อมูลผู้ใช้
- **categories** - หมวดหมู่สินค้า
- **products** - ข้อมูลสินค้า
- **product_images** - รูปภาพสินค้า
- **attributes** - คุณสมบัติสินค้า
- **attribute_values** - ค่าคุณสมบัติ

### Order & Payment:
- **orders** - ข้อมูลการสั่งซื้อ
- **order_items** - รายการสินค้าในการสั่งซื้อ
- **carts** - ตะกร้าสินค้า
- **cart_items** - รายการสินค้าในตะกร้า
- **transactions** - บันทึกการชำระเงิน

### Community:
- **questions** - คำถาม
- **answers** - คำตอบ
- **question_images** - รูปภาพคำถาม
- **votes** - การลงคะแนน

### User Relations:
- **addresses** - ที่อยู่ผู้ใช้
- **wishlists** - รายการสินค้าโปรด
- **reviews** - รีวิวสินค้า
- **email_verification_codes** - โค้ดยืนยันอีเมล

### Admin:
- **coupons** - คูปองส่วนลด
- **activity_logs** - บันทึกกิจกรรม
- **settings** - ตั้งค่าระบบ

---

## 🚀 การติดตั้งและเรียกใช้

### ข้อกำหนดเบื้องต้น:
- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- Composer
- Git

### ขั้นตอนการติดตั้ง:

1. **Clone Repository:**
```bash
git clone <repository-url>
cd 3c-gadget-hub
```

2. **ติดตั้ง Dependencies:**
```bash
composer install
npm install
```

3. **ตั้งค่า Environment:**
```bash
cp .env.example .env
php artisan key:generate
```

4. **ตั้งค่า Database:**
- สร้าง MySQL database: `3c-gadget_hub`
- อัปเดต `.env` ด้วยข้อมูล database

5. **Migration & Seeding:**
```bash
php artisan migrate
php artisan db:seed
```

6. **ตั้งค่า Storage Link:**
```bash
php artisan storage:link
```

7. **Build Frontend:**
```bash
npm run build
```

8. **เรียกใช้ Application:**
```bash
php artisan serve
```

จากนั้นเข้าไปที่ `http://127.0.0.1:8000`

---

## 🔑 ตั้งค่า API Keys

### Google OAuth:
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง OAuth 2.0 Credentials
3. ตั้ง Authorized Redirect URI: `http://127.0.0.1:8000/login/google/callback`
4. อัปเดต `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT=http://127.0.0.1:8000/login/google/callback
```

### Google reCAPTCHA v2:
1. ไปที่ [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. สร้าง reCAPTCHA v2 (Checkbox)
3. อัปเดต `.env`:
```env
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

### Email Configuration (Gmail):
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

### Stripe Payment:
1. สร้างบัญชี [Stripe](https://stripe.com)
2. ตั้งค่าในแอดมิน Dashboard

### PromptPay Integration:
1. ตั้ค่า PromptPay ID ใน Admin Payment Settings
2. SlipOK credentials:
```env
SLIPOK_BRANCH_ID=55274
SLIPOK_API_KEY=your_api_key
```

---

## 📱 การใช้งาน

### สำหรับผู้ซื้อ:
1. สมัครสมาชิกและยืนยันอีเมล
2. ค้นหาสินค้าตามหมวดหมู่
3. อ่านรีวิวและเปรียบเทียบราคา
4. เพิ่มสินค้าลงตะกร้า
5. ปรับใบเสร็จและเลือกที่อยู่
6. เลือกวิธีชำระเงินและปิดการสั่งซื้อ
7. ตรวจสอบสถานะการสั่งซื้อ

### สำหรับแอดมิน:
1. เข้าสู่ระบบด้วยบัญชีแอดมิน
2. ไปที่ `/admin/dashboard`
3. จัดการสินค้า หมวดหมู่ คำสั่งซื้อ ผู้ใช้
4. ตรวจสอบรายงาน
5. ตั้งค่าคูปอง และการชำระเงิน

---

## 🛠️ Development

### Build Commands:
```bash
# Development server
npm run dev

# Production build
npm run build

# PHPUnit testing
php artisan test

# Code analysis
php artisan tinker
```

### Cache Commands:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan cache:clear
```

---

## 📝 ระบบ Email

### ประเภท Email:
- ✅ Email Verification (ยืนยันบัญชี)
- ✅ Password Reset (รีเซ็ตรหัสผ่าน)
- ✅ Order Confirmation (ยืนยันการสั่งซื้อ)
- ✅ Payment Status (สถานะการชำระเงิน)
- ✅ Shipping Notification (แจ้งสถานะจัดส่ง)

### Configuration:
ตั้งค่าผ่านไฟล์ `.env` โดยใช้ Gmail SMTP:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_ENCRYPTION=tls
```

---

## 🔧 Troubleshooting

### Issue: "The g-recaptcha-response field is required"
**Solution:** 
- ตรวจสอบว่า reCAPTCHA Site Key ถูกตั้ง
- ล้าง browser cache
- ตรวจสอบ console สำหรับข้อผิดพลาด

### Issue: Email not sending
**Solution:**
- ตรวจสอบ Gmail App Password (ไม่ใช่ regular password)
- เปิด "Less secure app access" ถ้า Gmail ต่อการเข้าถึง
- ตรวจสอบ `.env` MAIL configuration

### Issue: Payment Integration Failed
**Solution:**
- ตรวจสอบ API Keys ใน Admin Payment Settings
- ตรวจสอบ SSL/HTTPS enabled
- ตรวจสอบ webhook URL ที่จดทะเบียน

---

## 📚 API Endpoints

### Public Endpoints:
- `GET /` - Home page
- `GET /products` - Product listing
- `GET /products/{slug}` - Product details
- `GET /community/questions` - Questions list
- `GET /community/questions/{question}` - Question details

### Protected Endpoints (Auth Required):
- `POST /cart/add/{product}` - Add to cart
- `GET /wishlist` - View wishlist
- `POST /community/questions` - Create question
- `POST /community/questions/{question}/answers` - Answer question

### Admin Endpoints (Admin Role Required):
- `GET /admin/dashboard` - Admin dashboard
- `POST /admin/products` - Create product
- `PUT /admin/orders/{order}` - Update order
- `DELETE /admin/users/{user}` - Delete user

---

## 🌟 Future Enhancements

- 🔄 Real-time inventory sync
- 📊 Advanced analytics dashboard
- 🤖 AI-powered product recommendations
- 💬 Live chat support
- 📱 Mobile app (native)
- 🌍 Multi-currency support
- 🎁 Loyalty points system
- 📦 Advanced shipping integrations

---

## 📞 Support & Contact

สำหรับข้อมูลเพิ่มเติม ติดต่อ:
- Email: support@3cgadgethub.com
- Website: https://3cgadgethub.com
- Facebook: @3CGadgetHub

---

## 📄 License

MIT License - สำหรับข้อมูลเพิ่มเติม ดูไฟล์ LICENSE

---

## 👨‍💻 Contributors

ระบบนี้ได้รับการพัฒนาโดยทีม 3C Gadget Hub

---

**ปรับปรุงล่าสุด:** 21 พฤศจิกายน 2567

ขอบคุณที่ใช้ 3C Gadget Hub! 🎉
