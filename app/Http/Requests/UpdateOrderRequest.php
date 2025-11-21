<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Log;

class UpdateOrderRequest extends FormRequest
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
            // Allow any string for status here — the Order model will map UI values
            // to DB enum values via the mutator. Using a permissive rule avoids
            // 422 errors caused by mismatched enum names during admin editing.
            'status' => ['sometimes', 'nullable', 'string'],
            // Be permissive for payment_status as well to avoid strict enum
            // validation failing for UI-friendly values.
            'payment_status' => ['sometimes', 'nullable', 'string'],
            'shipping_method' => ['sometimes', 'nullable', 'string'],
            'shipping_fee' => ['sometimes', 'numeric', 'min:0'],
            'tracking_number' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
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
            'status.in' => 'Invalid order status.',
            'payment_status.in' => 'Invalid payment status.',
            'shipping_fee.min' => 'Shipping fee cannot be negative.',
        ];
    }

    /**
     * Log validation failures to help debugging in development.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     */
    protected function failedValidation(Validator $validator)
    {
        Log::warning('UpdateOrderRequest validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input' => $this->all()
        ]);

        parent::failedValidation($validator);
    }
}