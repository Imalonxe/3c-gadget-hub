สรุปการจัดการคิว (Queue) สำหรับการพัฒนา

สาเหตุที่คุณไม่เห็นแถวในตาราง `notifications`:
- ระบบตั้งค่า `QUEUE_CONNECTION=database` (ในไฟล์ `.env`) ซึ่งหมายความว่า `notify()` จะ "enqueue" งานไว้ในตาราง `jobs` ไม่ได้ทำงานทันที
- เพื่อให้การแจ้งเตือน (database/mail/broadcast) ถูกสร้างจริง ต้องมี worker มาประมวลผลงานในตาราง `jobs`

วิธีแก้ (เลือกอย่างใดอย่างหนึ่งตามที่ต้องการ):

1) รัน worker แบบประมวลผลแล้วหยุด (process backlog ครั้งเดียว)
- เหมาะเมื่ออยากประมวลงานค้างทั้งหมดแล้วหยุด

PowerShell:
```powershell
php artisan queue:work --stop-when-empty --tries=3
```

2) รัน worker แบบถาวร (แนะนำสำหรับ dev ที่ต้องการให้คิวทำงานต่อเนื่อง)
- เปิด terminal แยกแล้วรันคำสั่งนี้ (จะไม่กลับ prompt จะค้างรันตลอดจนกว่าจะหยุด)

PowerShell:
```powershell
php artisan queue:work --tries=3
```

3) ทำให้ notify ทำงานทันที (ไม่ต้องรัน worker) — สำหรับการทดสอบเร็วในเครื่อง
- แก้ไฟล์ `.env` ให้เป็น
```
QUEUE_CONNECTION=sync
```
- แล้วล้าง cache ของ config

PowerShell:
```powershell
php artisan config:clear
php artisan route:clear
php artisan view:clear
```
- จากนั้นลองเปลี่ยนสถานะคำสั่งซื้อหรือรันสคริปต์ทดสอบ

PowerShell:
```powershell
php scripts/run_test_notify.php
```
- ผลลัพธ์ควรแสดงค่า `NOTIFICATIONS` ที่เพิ่มขึ้น และแถวใหม่ในตาราง `notifications`

การตรวจสอบสถานะคิว/แถว:
- ตรวจสอบจำนวนงานค้างในตาราง jobs / failed_jobs:

PowerShell (ใช้ tinker):
```powershell
php artisan tinker
# ใน tinker:
DB::table('jobs')->count()
DB::table('failed_jobs')->count()
DB::table('notifications')->orderBy('created_at','desc')->limit(5)->get()
```

คำแนะนำเพิ่มเติม:
- สำหรับการใช้งานจริง (production) ควรตั้ง worker ให้รันตลอดด้วย Supervisor หรือ systemd
- ถ้าต้องการผมช่วยตั้งค่า script รอบริการ worker สำหรับ dev (เช่น task ใน `composer.json` หรือ `README` เพิ่ม) บอกผมได้เลย

ถ้าต้องการ ผมสามารถรัน `php artisan queue:work --stop-when-empty --tries=3` ให้ตอนนี้ (จะประมวล backlog ให้) หรือตั้ง `QUEUE_CONNECTION=sync` ชั่วคราวแล้วทดสอบการแจ้งเตือนให้ดูทันที