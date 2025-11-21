<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Exception;

class StripePaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent for the order
     */
    public function createPaymentIntent(Order $order)
    {
        try {
            $amount = (int) round($order->total_amount * 100); // convert to cents/lowest currency unit

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount, // Stripe expects integer amount in smallest currency unit
                'currency' => 'thb',
                'metadata' => [
                    // use the model's primary key column `order_id` so webhooks can find the order
                    'order_id' => $order->order_id,
                    'order_number' => $order->order_number
                ]
            ]);

            return [
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id
            ];
        } catch (Exception $e) {
            throw new Exception('Error creating payment intent: ' . $e->getMessage());
        }
    }

    /**
     * Handle successful payment
     */
    public function handleSuccessfulPayment(Order $order, $paymentIntentId)
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                $order->update([
                    'payment_status' => Order::PAYMENT_PAID,
                    'status' => Order::STATUS_PROCESSING,
                    'payment_details' => [
                        'payment_intent_id' => $paymentIntentId,
                        'payment_method' => $paymentIntent->payment_method_types[0],
                        'paid_at' => now()
                    ]
                ]);

                // You might want to send confirmation email here
                return true;
            }

            return false;
        } catch (Exception $e) {
            throw new Exception('Error processing payment: ' . $e->getMessage());
        }
    }

    /**
     * Handle failed payment
     */
    public function handleFailedPayment(Order $order, $paymentIntentId)
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            $order->update([
                'payment_status' => Order::PAYMENT_FAILED,
                'payment_details' => [
                    'payment_intent_id' => $paymentIntentId,
                    'error' => $paymentIntent->last_payment_error,
                    'failed_at' => now()
                ]
            ]);

            return true;
        } catch (Exception $e) {
            throw new Exception('Error handling failed payment: ' . $e->getMessage());
        }
    }
}