# This script sets up Windows Task Scheduler to run the queue worker automatically
# Run this as Administrator

$taskName = "3C-Gadget-Hub-Queue-Worker"
$scriptPath = "C:\xampp\htdocs\3c-gadget-hub\scripts\start-queue-worker.bat"
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($taskExists) {
    Write-Host "Task already exists. Removing old task..."
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create task action
$action = New-ScheduledTaskAction -Execute $scriptPath

# Create task trigger - run at startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create task settings
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable $true -RunOnlyIfNetworkAvailable $false

# Register the task to run as SYSTEM (highest privileges)
Register-ScheduledTask -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Description "Runs Laravel Queue Worker for 3C Gadget Hub notifications" `
    -User "SYSTEM"

Write-Host "✓ Task '$taskName' created successfully!"
Write-Host "The queue worker will now start automatically when Windows boots."
Write-Host ""
Write-Host "To manage this task:"
Write-Host "  - View: tasklist /v /fi 'IMAGENAME eq php.exe'"
Write-Host "  - Start: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "  - Stop: Stop-ScheduledTask -TaskName '$taskName'"
Write-Host "  - Remove: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
