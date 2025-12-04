# 🔧 วิธีแก้ไข: ฐานข้อมูล Testing ไม่พบ

## ❌ ปัญหา

เมื่อรัน `php artisan test` ได้ข้อผิดพลาด:
```
SQLSTATE[HY000] [1049] Unknown database '3c_gadget_hub_testing'
```

**สาเหตุ:** Laravel ต้องการ **ฐานข้อมูล testing แยก** สำหรับการทดสอบ แต่ยังไม่มีหรือตั้งค่าไม่ถูกต้อง

---

## ✅ วิธีแก้ไข (MySQL)

### **วิธีที่ 1: สร้างฐานข้อมูล Testing (แนะนำ)**

#### ขั้นตอนที่ 1: เปิด MySQL Command Line

**Windows:**
```powershell
mysql -u root -p
```
(ปกติ password ว่างเปล่า ให้กด Enter)

#### ขั้นตอนที่ 2: สร้างฐานข้อมูล Testing

```sql
CREATE DATABASE 3c_gadget_hub_testing;
```

#### ขั้นตอนที่ 3: ออกจาก MySQL

```sql
EXIT;
```

---

### **วิธีที่ 2: แก้ไข .env ให้ใช้ SQLite (เร็วกว่าสำหรับ Testing)**

หากไม่อยากสร้างฐานข้อมูล MySQL เพิ่ม สามารถใช้ SQLite สำหรับ testing

#### ขั้นตอนที่ 1: เปิดไฟล์ `.env`

```
c:\xampp\htdocs\3c-gadget-hub\.env
```

#### ขั้นตอนที่ 2: หาส่วน Testing Database

หาบรรทัดนี้:
```env
DB_TEST_CONNECTION=mysql
DB_TEST_DATABASE=3c_gadget_hub_testing
```

#### ขั้นตอนที่ 3: เปลี่ยนเป็น SQLite

แก้เป็น:
```env
DB_TEST_CONNECTION=sqlite
DB_TEST_DATABASE=:memory:
```

#### ขั้นตอนที่ 4: เซฟไฟล์ และ clear cache

```powershell
php artisan config:clear
```

---

### **วิธีที่ 3: ตั้งค่าใน phpunit.xml (ให้ Laravel auto-create)**

เปิดไฟล์ `phpunit.xml` ในรูท โปรเจค และแก้ไข:

```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_DATABASE" value="3c_gadget_hub_testing"/>
<env name="DB_HOST" value="127.0.0.1"/>
<env name="DB_PORT" value="3306"/>
<env name="DB_USERNAME" value="root"/>
<env name="DB_PASSWORD" value=""/>
```

---

## 🚀 รัน Tests

หลังจากตั้งค่าเสร็จ ให้รัน:

```powershell
php artisan test
```

หรือรัน test ไฟล์เฉพาะ:

```powershell
php artisan test tests/Feature/ProfileTest.php
```

---

## 📋 ตัวอย่าง: ใช้ SQLite (วิธีที่ 2) - แนะนำสำหรับ Development

### ขั้นตอนทั้งหมด:

**1. เปิด PowerShell ในโปรเจค:**
```powershell
cd c:\xampp\htdocs\3c-gadget-hub
```

**2. ก้อไฟล์ `.env`** และแก้ไขส่วนท้าย:
```env
# Testing Database (เพิ่มบรรทัดนี้ถ้าไม่มี)
DB_TEST_CONNECTION=sqlite
DB_TEST_DATABASE=:memory:
```

**3. Clear cache:**
```powershell
php artisan config:clear
```

**4. รัน tests:**
```powershell
php artisan test
```

---

## ✨ เหตุผล: SQLite vs MySQL สำหรับ Testing

| ด้าน | SQLite (`:memory:`) | MySQL |
|------|-------------------|--------|
| **ความเร็ว** | ⚡ ซูเปอร์เร็ว | ⏱️ ปกติ |
| **Setup** | ✅ ไม่ต้อง create DB | ❌ ต้องสร้าง DB |
| **Cleanup** | ✅ อัตโนมัติ (หาย) | ❌ ต้องลบเอง |
| **Storage** | ✅ เก็บใน RAM | ❌ ต้องเก็บ Disk |
| **ความแม่นยำ** | ⚠️ ไม่เหมือน MySQL | ✅ เหมือน Production |

**แนะนำ:** ใช้ **SQLite สำหรับ dev** (เร็ว ง่าย) แต่เมื่อไปใช้จริง ก็ทดสอบกับ MySQL

---

## 🐛 หากยังไม่ได้ ให้ลองคำสั่งเหล่านี้:

### 1. Reset Database
```powershell
php artisan migrate:fresh
```

### 2. Clear all cache
```powershell
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 3. ตรวจสอบ DB connection
```powershell
php artisan tinker
# แล้วพิมพ์:
DB::connection('test')->getPdo()
```

### 4. รัน tests ใหม่
```powershell
php artisan test --verbose
```

---

## 💡 หากต้องการ MySQL Testing (ไม่ใช้ SQLite)

### ขั้นตอนสร้างฐานข้อมูล Testing:

**PowerShell:**
```powershell
mysql -u root -p -e "CREATE DATABASE 3c_gadget_hub_testing;"
```

**MySQL CLI:**
```sql
CREATE DATABASE 3c_gadget_hub_testing;
CREATE USER 'test_user'@'localhost' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON 3c_gadget_hub_testing.* TO 'test_user'@'localhost';
FLUSH PRIVILEGES;
```

แล้วแก้ `.env`:
```env
DB_TEST_CONNECTION=mysql
DB_TEST_DATABASE=3c_gadget_hub_testing
DB_TEST_USERNAME=test_user
DB_TEST_PASSWORD=test_password
```

---

## 🎯 สรุป: ทำตามขั้นตอนนี้

1. **เลือกวิธี:**
   - 🟢 **SQLite (ง่ายสุด)** ← แนะนำ
   - 🟡 MySQL Testing DB (ต้อง create DB)

2. **แก้ไข `.env`** ตามวิธีที่เลือก

3. **รัน:**
   ```powershell
   php artisan config:clear
   php artisan test
   ```

4. **ตรวจสอบ:** ผ่านแล้ว ✅

---

**หลังจากแก้ไขเสร็จ tests ก็จะวิ่งไป! 🚀**
