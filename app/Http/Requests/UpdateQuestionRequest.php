<?php

namespace App\Http\Requests;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->question);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'status' => ['sometimes', 'string', Rule::in([
                Question::STATUS_PENDING,
                Question::STATUS_PUBLISHED,
                Question::STATUS_CLOSED,
                Question::STATUS_HIDDEN
            ])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'], // 5MB max per image
            'deleted_image_ids' => ['nullable', 'string'] // JSON string of image IDs to delete
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
            'title.min' => 'Question title must be at least 10 characters.',
            'content.min' => 'Question content must be at least 20 characters.',
            'tags.*.max' => 'Each tag must not exceed 50 characters.',
            'status.in' => 'Invalid question status.',
        ];
    }
}