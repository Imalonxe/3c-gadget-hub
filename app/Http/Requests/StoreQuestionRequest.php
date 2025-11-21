<?php

namespace App\Http\Requests;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StoreQuestionRequest extends FormRequest
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
            'product_id' => ['nullable', 'exists:products,id'],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'], // 5MB max per image
            'status' => ['sometimes', 'string', Rule::in([
                Question::STATUS_PENDING,
                Question::STATUS_PUBLISHED,
                Question::STATUS_CLOSED,
                Question::STATUS_HIDDEN
            ])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50']
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->ensureIsNotRateLimited($validator);
        });
    }

    /**
     * Ensure the request is not rate limited.
     */
    protected function ensureIsNotRateLimited($validator): void
    {
        $key = 'question-post:' . auth()->id();

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);

            $validator->errors()->add(
                'rate_limit',
                "คุณสามารถโพสคำถามได้เพียง 1 ครั้งต่อชั่วโมง กรุณารออีก {$minutes} นาที"
            );
        }
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        $key = 'question-post:' . auth()->id();
        RateLimiter::hit($key, 3600); // 1 hour = 3600 seconds
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.min' => 'Question title must be at least 10 characters.',
            'content.min' => 'Question content must be at least 20 characters.',
            'product_id.exists' => 'The selected product does not exist.',
            'tags.*.max' => 'Each tag must not exceed 50 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth()->id(),
            'status' => Question::STATUS_PENDING,
        ]);
    }
}