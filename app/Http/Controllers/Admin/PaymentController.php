<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class PaymentController extends Controller
{
    public function index()
    {
        $promptpay = Setting::get('promptpay_phone', env('PROMPTPAY_ID'));

        return Inertia::render('Admin/Payment/Index', [
            'promptpay_phone' => $promptpay,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'promptpay_phone' => 'required|string'
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->input('promptpay_phone'));

        Setting::set('promptpay_phone', $phone);

        return redirect()->back()->with('success', 'PromptPay phone saved.');
    }
}
