# คู่มือ Queue Worker

## Queue คืออะไร?

Queue คือระบบที่ส่งงานไปไว้ในแถวคอยเพื่อให้ background worker มาประมวลผลในภายหลัง ไม่ต้องรอผลทันที

**ตัวอย่าง:** ส่งอีเมล, สร้าง PDF, อัพโหลดไฟล์ - ไม่ต้องรอให้เสร็จในการ request เดียวกัน

---

## โครงสร้าง Queue

```
User Request → Job สร้างขึ้น → Queue (Database) → Worker ประมวลผล → เสร็จ
```


## วิธีรัน Queue Worker

### 1. หลายคนใช้ PowerShell บน Windows

```powershell
# เทอร์มินัลใหม่ในโปรเจค
php artisan queue:work
---

## คำสั่ง Queue ที่สำคัญ

| คำสั่ง | ความหมาย |
|-------|---------|
| `php artisan queue:work` | เริ่ม queue worker (รอฟังงาน) |
| `php artisan queue:work --timeout=60` | Worker โดยมี timeout 60 วินาที |
| `php artisan queue:failed` | ดูงานที่ล้มเหลว |
| `php artisan queue:retry all` | ลองประมวลผลงานล้มเหลวใหม่ |
| `php artisan queue:flush` | ลบงานทั้งหมดออก |

---

**เขียนเมื่อ:** November 28, 2025
