<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Settings feature has been removed. Keep a lightweight controller stub to avoid class-not-found issues
// in environments that still reference the class (routes were removed). If you want the file fully
// deleted from the repository, remove this file as well.
class SettingController extends Controller
{
    public function index()
    {
        // Redirect to admin dashboard if someone tries to access the old URL
        return redirect()->route('admin.dashboard');
    }

    public function update(Request $request)
    {
        // No-op: settings are removed. Redirect back to dashboard.
        return redirect()->route('admin.dashboard');
    }
}
