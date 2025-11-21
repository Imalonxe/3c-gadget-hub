<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('manage coupons');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:coupons,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage,free_shipping',
            // value is not required for free_shipping type
            'value' => 'required_unless:type,free_shipping|nullable|numeric|min:0',
            'min_order_amount' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'category_id' => 'nullable|exists:categories,category_id',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at'
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'This coupon code is already in use.',
            'value.min' => 'The discount value must be greater than 0.',
            'min_order_amount.min' => 'The minimum order amount must be greater than 0.',
            'max_uses.min' => 'Maximum uses must be at least 1.',
            'expires_at.after' => 'The expiry date must be after the start date.'
        ];
    }
}