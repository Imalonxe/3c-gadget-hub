<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'order_number' => ['required', 'string', 'unique:orders,order_number'],
            'status' => ['required', 'string', Rule::in([
                Order::STATUS_PENDING,
                Order::STATUS_PROCESSING,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
                Order::STATUS_REFUNDED
            ])],
            'payment_status' => ['required', 'string', Rule::in([
                Order::PAYMENT_PENDING,
                Order::PAYMENT_PAID,
                Order::PAYMENT_FAILED,
                Order::PAYMENT_REFUNDED
            ])],
            'payment_method' => ['required', 'string'],
            'shipping_method' => ['required', 'string'],
            'shipping_fee' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.full_name' => ['required', 'string'],
            'shipping_address.phone' => ['required', 'string'],
            'shipping_address.address_line1' => ['required', 'string'],
            'shipping_address.address_line2' => ['nullable', 'string'],
            'shipping_address.city' => ['required', 'string'],
            'shipping_address.state' => ['required', 'string'],
            'shipping_address.postal_code' => ['required', 'string'],
            'shipping_address.country' => ['required', 'string'],
            'billing_address' => ['required', 'array'],
            'billing_address.full_name' => ['required', 'string'],
            'billing_address.phone' => ['required', 'string'],
            'billing_address.address_line1' => ['required', 'string'],
            'billing_address.address_line2' => ['nullable', 'string'],
            'billing_address.city' => ['required', 'string'],
            'billing_address.state' => ['required', 'string'],
            'billing_address.postal_code' => ['required', 'string'],
            'billing_address.country' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.product_name' => ['required', 'string'],
            'items.*.product_sku' => ['required', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required in the order.',
            'items.*.product_id.exists' => 'One or more selected products do not exist.',
            'items.*.quantity.min' => 'Quantity must be at least 1 for each item.',
            'shipping_address.required' => 'Shipping address is required.',
            'billing_address.required' => 'Billing address is required.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('order_number')) {
            $this->merge([
                'order_number' => 'ORD-' . strtoupper(uniqid())
            ]);
        }
    }
}