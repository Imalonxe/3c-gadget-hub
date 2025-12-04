# คู่มือการติดตั้งโปรเจค 3C Gadget Hub

## ข้อกำหนดเบื้องต้น

ก่อนเริ่มติดตั้ง โปรดตรวจสอบให้แน่ใจว่าระบบของคุณมีสิ่งต่อไปนี้:

- **PHP 8.1 หรือสูงกว่า** (ตรวจสอบด้วย `php -v`)
- **Composer** (ตรวจสอบด้วย `composer -v`)
- **Node.js 16+** และ **npm** (ตรวจสอบด้วย `node -v` และ `npm -v`)
- **MySQL 8.0 หรือ MariaDB 10.3+**
- **Git** (ตรวจสอบด้วย `git --version`)

---

## ขั้นตอนการติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/Imalonxe/3c-gadget-hub.git
cd 3c-gadget-hub
```

### 2. ติดตั้ง PHP Dependencies

```bash
composer install
```

### 3. ติดตั้ง Node.js Dependencies

```bash
npm install
```

### 4. สร้างไฟล์ .env

คัดลอก `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```

จากนั้นแก้ไขไฟล์ `.env` ตั้งค่า:

```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=3c_gadget_hub
DB_USERNAME=root
DB_PASSWORD=

# Application
APP_NAME="3C Gadget Hub"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### 5. สร้างApplication Key

```bash
php artisan key:generate
```

### 6. สร้างฐานข้อมูลและ Migration

หากยังไม่มีฐานข้อมูล ให้รันสคริปต์ SQL:

```bash
mysql -u root -p < scripts/create_mysql_database.sql
```

จากนั้น รัน migration:

```bash
php artisan migrate
```

### 7. สร้าง Symbolic Link สำหรับ Storage

```bash
php artisan storage:link
```

### 8. เรียกใช้งานโปรเจค

เปิดเทอร์มินัล 2 หน้าต่าง:

**เทอร์มินัลที่ 1 - เรียกใช้ Laravel Server:**

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Server จะทำงานที่ `http://127.0.0.1:8000`

**เทอร์มินัลที่ 2 - เรียกใช้ Vite (Frontend Development):**

```bash
npm run dev
```

---

## การใช้งานพื้นฐาน

### สร้าง Model ใหม่

```bash
php artisan make:model ModelName -m
```

### สร้าง Controller ใหม่

```bash
php artisan make:controller ControllerName
```

### สร้าง Migration ใหม่

```bash
php artisan make:migration create_table_name
```

### รัน Migration

```bash
php artisan migrate
```

### Rollback Migration

```bash
php artisan migrate:rollback
```

### Clear Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## โครงสร้างโปรเจค

```
3c-gadget-hub/
├── app/
│   ├── Console/          # Artisan commands
│   ├── Http/
│   │   ├── Controllers/  # Controllers
│   │   ├── Middleware/   # Middleware
│   │   └── Requests/     # Form Requests
│   ├── Models/           # Eloquent Models
│   ├── Jobs/             # Queue Jobs
│   ├── Notifications/    # Notifications
│   └── Services/         # Business Logic
├── resources/
│   ├── js/               # Vue Components & JS
│   ├── css/              # Styles (Tailwind)
│   └── views/            # Blade Templates
├── routes/
│   ├── web.php          # Web Routes
│   ├── api.php          # API Routes
│   └── auth.php         # Auth Routes
├── database/
│   ├── migrations/      # Database Migrations
│   ├── seeders/         # Database Seeders
│   └── factories/       # Model Factories
├── config/              # Configuration Files
├── storage/             # Storage (logs, cache, files)
├── public/              # Public Files
└── tests/               # Tests
```

---

## Tech Stack

- **Backend:** Laravel 11
- **Frontend:** Vue 3 + Inertia.js
- **CSS Framework:** Tailwind CSS
- **Build Tool:** Vite
- **Database:** MySQL
- **PDF Generation:** DOMPDF, mPDF
- **Payment Gateway:** Stripe

---

## Troubleshooting

### ปัญหา: Class not found

```bash
php artisan dump-autoload
composer dump-autoload
```

### ปัญหา: Database connection error

- ตรวจสอบการตั้งค่า `.env`
- ตรวจสอบว่า MySQL ทำงานอยู่
- ตรวจสอบ username และ password

### ปัญหา: Storage permission denied

```bash
# Windows (ใน PowerShell as Admin)
icacls "storage" /grant:r "%USERNAME%:F" /t

# Linux/Mac
chmod -R 775 storage bootstrap/cache
```

### ปัญหา: npm run dev error

```bash
npm cache clean --force
rm -r node_modules
npm install
npm run dev
```

### ปัญหา: Vite Not Found

ตรวจสอบว่า `vite.config.js` อยู่ในรูทของโปรเจค

---

## Development Commands

| คำสั่ง | การใช้งาน |
|---------|----------|
| `php artisan serve` | เรียกใช้ Laravel development server |
| `npm run dev` | เรียกใช้ Vite development server |
| `npm run build` | Build สำหรับ production |
| `php artisan tinker` | เปิด Laravel REPL |
| `php artisan migrate:fresh` | Reset database และรัน migrations ใหม่ |
| `php artisan db:seed` | Seed database |
| `./vendor/bin/phpunit` | รัน tests |

---

**เขียนเมื่อ:** November 28, 2025
