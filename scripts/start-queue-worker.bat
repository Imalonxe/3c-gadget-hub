@echo off
REM Start Laravel Queue Worker
REM This script keeps the queue worker running and restarts it if it crashes

:start
echo [%date% %time%] Starting Laravel Queue Worker...
cd /d C:\xampp\htdocs\3c-gadget-hub
php artisan queue:work --queue=default --tries=3 --timeout=90

REM If queue worker exits, restart it after 5 seconds
echo [%date% %time%] Queue Worker stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak
goto start
