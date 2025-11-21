<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\StripePaymentService;
use App\Models\Transaction;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $stripeService;

    public function __construct(StripePaymentService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Show payment page for the order.
     */
    public function show(Order $order)
    {
        // Check if order belongs to current user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if order is still pending payment
        if ($order->payment_status !== Order::PAYMENT_PENDING) {
            return redirect()->route('user.orders.show', $order)
                ->with('error', 'This order has already been paid for or cancelled.');
        }

        $order->load(['items.product', 'items.product.images' => function($query) {
            $query->limit(1);
        }]);

        // Debug: log entry to help diagnose missing QR image issues
        try {
            Log::info('PaymentController::show called', [
                'order_id' => $order->order_id,
                'user_id' => $order->user_id,
                'auth_id' => auth()->id(),
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'configured_promptpay' => Setting::get('promptpay_phone', env('PROMPTPAY_ID'))
            ]);
        } catch (\Exception $e) {
            // Don't let logging break the page; log at error channel if needed
            Log::error('Failed to write debug log in PaymentController::show: ' . $e->getMessage());
        }

    $qrImageUrl = null;
    $promptpayPayload = null;

        // If this order uses PromptPay, attempt to build a PromptPay EMV payload and expose a QR image URL
        if ($order->payment_method === 'promptpay') {
            // Prefer admin-configured PromptPay phone/id in DB, fallback to .env for backward compatibility
            $promptpayId = Setting::get('promptpay_phone', env('PROMPTPAY_ID'));

            if (!empty($promptpayId)) {
                // Build EMV payload according to PromptPay/EMVCo simple template
                // Helper to format TLV: tag (2 digits) + length (2 digits) + value
                $tlv = function($tag, $value) {
                    $len = str_pad(strlen($value), 2, '0', STR_PAD_LEFT);
                    return $tag . $len . $value;
                };

                // GUI for PromptPay
                $gui = 'A000000677010111';

                // Merchant Account Information (tag 29) sub-fields: 00=GUI, 01=PromptPay ID
                // PromptPay expects numeric-only IDs (phone numbers or citizen ID)
                $cleanId = preg_replace('/[^0-9]/', '', $promptpayId);
                $mai = $tlv('00', $gui) . $tlv('01', $cleanId);
                $maiWrapped = $tlv('29', $mai);

                // Payload Format Indicator
                $payload = $tlv('00', '01');
                // Point of initiation '12' = dynamic QR (contains amount)
                $payload .= $tlv('01', '12');
                $payload .= $maiWrapped;

                // Merchant category code (default 0000), currency THB=764
                $payload .= $tlv('52', '0000');
                $payload .= $tlv('53', '764');

                // Amount (tag 54) - formatted without extra zeros, use order total_amount
                $amount = number_format((float)$order->total_amount, 2, '.', '');
                $payload .= $tlv('54', $amount);

                // Country
                $payload .= $tlv('58', 'TH');

                // Merchant name and city (use app name)
                $appName = env('APP_NAME', 'Merchant');
                $payload .= $tlv('59', strtoupper(substr($appName, 0, 25)));
                $payload .= $tlv('60', strtoupper('Bangkok'));

                // Additional Data Field Template (tag 62) - include order id as reference (subtag 01)
                $adf = $tlv('01', (string)$order->order_number);
                $payload .= $tlv('62', $adf);

                // Append CRC placeholder tag (63) + length 04 and calculate CRC16-CCITT (XModem)
                $payloadForCrc = $payload . '6304';

                // CRC-16/CCITT (XModem) implementation
                $crc16 = function($str) {
                    $poly = 0x1021;
                    $crc = 0x0000;
                    $bytes = unpack('C*', $str);
                    foreach ($bytes as $b) {
                        $crc ^= ($b << 8);
                        for ($i = 0; $i < 8; $i++) {
                            if (($crc & 0x8000) !== 0) {
                                $crc = (($crc << 1) & 0xFFFF) ^ $poly;
                            } else {
                                $crc = ($crc << 1) & 0xFFFF;
                            }
                        }
                    }
                    return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
                };
                $crc = $crc16($payloadForCrc);
                $payload .= '63' . '04' . $crc;

                // Store the raw EMV payload so the frontend can render it locally (safer, no external host required)
                $promptpayPayload = $payload;

                // Build a QR image URL using a public QR generation service (for dev). Encode the EMV payload.
                // Use api.qrserver.com which is generally available and returns a direct PNG image.
                $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($payload);

                // Log payload and generated URL for debugging in local dev.
                Log::info('PromptPay QR payload generated', [
                    'order_id' => $order->order_id,
                    'promptpay_id' => $cleanId,
                    'payload' => $payload,
                    'qrImageUrl' => $qrImageUrl,
                ]);
            }
        }

        // Prepare frontend-friendly PromptPay fields
        $promptpayIdForFrontend = null;
        $promptpayAmountForFrontend = null;
        if (!empty($promptpayId) && isset($cleanId)) {
            $promptpayIdForFrontend = $cleanId;
            $promptpayAmountForFrontend = number_format((float)$order->total_amount, 2, '.', '');
        }

        return Inertia::render('Payment/Show', [
            'order' => $order,
            'paymentMethod' => $order->payment_method,
            'qrImageUrl' => $qrImageUrl,
            'promptpayPayload' => $promptpayPayload,
            'promptpayId' => $promptpayIdForFrontend,
            'promptpayAmount' => $promptpayAmountForFrontend,
        ]);
    }

    /**
     * Handle successful payment.
     */
    public function success(Request $request, Order $order)
    {
        // Only the owner of the order can view the success state
        if (!$request->user() || $order->user_id !== $request->user()->id) {
            abort(403);
        }

        // Prevent users from forcing unpaid orders into a "paid" state
        if ($order->payment_status !== Order::PAYMENT_PAID) {
            return redirect()
                ->route('payment.show', $order)
                ->with('error', 'คำสั่งซื้อยังไม่ถูกยืนยันการชำระเงิน กรุณาชำระหรืออัปโหลดสลิปให้เสร็จก่อน');
        }

        return redirect()
            ->route('checkout.success', $order)
            ->with('success', 'ระบบยืนยันการชำระเงินแล้ว');
    }

    /**
     * Handle failed payment.
     */
    public function failed(Order $order)
    {
        // Make sure the order belongs to the current user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // If payment failed (user cancelled), restore stock and remove the order
        // so it does not appear in the user's order history.
        try {
            DB::beginTransaction();

            // Load items with their products
            $order->load('items');

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) {
                        // restore stock
                        $product->increment('stock_quantity', $item->quantity);
                    }
                }
            }

            // Delete the order (order_items will be cascade-deleted by the DB)
            $order->delete();

            DB::commit();

            return redirect()->route('user.orders')
                ->with('error', 'Payment was cancelled. Please try again if you wish to complete your order.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to rollback order on payment failure: ' . $e->getMessage());

            // As a fallback, mark the order as failed so it is visible to admins for manual cleanup
            $order->update([
                'payment_status' => Order::PAYMENT_FAILED,
                'status' => Order::STATUS_CANCELLED
            ]);

            return redirect()->route('user.orders')
                ->with('error', 'Payment was cancelled. There was an error cleaning up the order; please contact support.');
        }
    }

    /**
     * Handle Stripe webhook.
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $request->getContent(),
                $sig_header,
                $endpoint_secret
            );

            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;
                    $order = Order::where('order_id', $paymentIntent->metadata->order_id)->first();
                    if ($order) {
                        $this->stripeService->handleSuccessfulPayment($order, $paymentIntent->id);
                    }
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    $order = Order::where('order_id', $paymentIntent->metadata->order_id)->first();
                    if ($order) {
                        $this->stripeService->handleFailedPayment($order, $paymentIntent->id);
                    }
                    break;
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Webhook error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Upload a PromptPay slip image and verify it with SlipOK API.
     */
    public function uploadSlip(Request $request, Order $order)
    {
        // Ensure order belongs to current user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'slip' => 'required_without:url|file|image|max:10240',
            'url' => 'required_without:slip|url'
        ]);

        try {
            $branchId = env('SLIPOK_BRANCH_ID');
            $apiKey = env('SLIPOK_API_KEY');

            if (empty($branchId) || empty($apiKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน กรุณาติดต่อฝ่ายบริการลูกค้า'
                ], 500);
            }

            $endpoint = 'https://api.slipok.com/api/line/apikey/' . $branchId;

            // Prepare request to SlipOK
            $http = Http::withHeaders([
                'x-authorization' => $apiKey
            ])->timeout(30);

            if ($request->hasFile('slip')) {
                $file = $request->file('slip');

                $response = $http->attach('files', fopen($file->getPathname(), 'r'), $file->getClientOriginalName())
                    ->post($endpoint, [ 'log' => true ]);
            } else {
                // url case
                $response = $http->post($endpoint, [
                    'url' => $request->input('url'),
                    'log' => true
                ]);
            }

            if ($response->successful()) {
                $json = $response->json();

                // If SlipOK responded with success and data.success true -> payment verified
                $verified = data_get($json, 'success') === true && data_get($json, 'data.success') === true;

                // Extract response amount and receiver for validation
                $respAmount = data_get($json, 'data.amount');
                $respReceiver = data_get($json, 'data.toAccount') ?: data_get($json, 'data.receive_id');

                // Compare amounts (normalize to two decimals)
                $orderAmount = number_format((float)$order->total_amount, 2, '.', '');
                if ($respAmount !== null) {
                    $respAmountNorm = number_format((float)$respAmount, 2, '.', '');
                } else {
                    $respAmountNorm = null;
                }

                // Get configured promptpay phone (numeric) from settings
                $configuredPromptpay = \App\Models\Setting::get('promptpay_phone', env('PROMPTPAY_ID'));
                $configuredPromptpay = preg_replace('/[^0-9]/', '', $configuredPromptpay ?? '');

                // Basic validation: amount must match and receiver must match configured PromptPay id
                $amountMatches = $respAmountNorm === null ? true : ($respAmountNorm === $orderAmount);
                $receiverMatches = true;
                if (!empty($respReceiver) && !empty($configuredPromptpay)) {
                    $receiverMatches = strpos(preg_replace('/[^0-9]/', '', $respReceiver), $configuredPromptpay) !== false;
                }

                // Only mark verified if SlipOK says success and both amount & receiver checks pass
                $verified = $verified && $amountMatches && $receiverMatches;

                // Create a Transaction record for audit
                $transaction = Transaction::create([
                    'order_id' => $order->order_id,
                    'transaction_id' => data_get($json, 'data.transRef') ?? null,
                    'payment_method' => 'promptpay',
                    'amount' => data_get($json, 'data.amount') ?? $order->total_amount,
                    'status' => $verified ? Transaction::STATUS_SUCCESS : Transaction::STATUS_FAILED,
                    'currency' => data_get($json, 'data.paidLocalCurrency') ?? '764',
                    'payment_details' => $json
                ]);

                if ($verified) {
                    // Mark order as paid
                    $order->update([
                        'payment_status' => Order::PAYMENT_PAID,
                        'order_status' => Order::STATUS_PROCESSING,
                        'paid_at' => now()
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'การตรวจสอบสลิปสำเร็จ ระบบได้ยืนยันการชำระเงินแล้ว',
                        // Frontend can redirect the user to the success page when this is present
                        'redirect' => route('payment.success', $order)
                    ]);
                }

                // Not verified: record transaction and return clear error message
                $transaction = Transaction::create([
                    'order_id' => $order->order_id,
                    'transaction_id' => data_get($json, 'data.transRef') ?? null,
                    'payment_method' => 'promptpay',
                    'amount' => $respAmount ?? $order->total_amount,
                    'status' => Transaction::STATUS_FAILED,
                    'currency' => data_get($json, 'data.paidLocalCurrency') ?? '764',
                    'payment_details' => $json
                ]);

                $reason = 'ไม่สามารถยืนยันการชำระเงินได้';
                if (!$amountMatches) {
                    $reason = 'จำนวนเงินที่โอนไม่ตรงกับยอดรวมของคำสั่งซื้อ กรุณาตรวจสอบและลองใหม่อีกครั้ง';
                } elseif (!$receiverMatches) {
                    $reason = 'บัญชีผู้รับเงินไม่ตรงกับบัญชีที่กำหนด กรุณาตรวจสอบและลองใหม่อีกครั้ง';
                }

                return response()->json([ 'success' => false, 'message' => $reason ], 400);
            }

            // Non-success response from SlipOK: include status and body in response for debugging
            $rawBody = $response->body();
            $parsed = null;
            try {
                $parsed = $response->json();
            } catch (\Exception $e) {
                // ignore parse errors
            }

            Log::error('SlipOK returned non-success response', [
                'order_id' => $order->order_id,
                'status' => $response->status(),
                'body' => $rawBody,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถตรวจสอบสลิปได้ในขณะนี้ กรุณาลองใหม่อีกครั้งหรือติดต่อฝ่ายบริการลูกค้า'
            ], 500);

        } catch (\Exception $e) {
            Log::error('SlipOK upload exception: ' . $e->getMessage(), [
                'order_id' => $order->order_id,
                'exception' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการอัพโหลดสลิป กรุณาลองใหม่อีกครั้งหรือติดต่อฝ่ายบริการลูกค้า'
            ], 500);
        }
    }
}