<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be handled by policies later
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            'category_name' => ['required', 'string', 'max:255', 'unique:categories,category_name'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];

        // parent_category_id and is_parent rules only relevant if DB column exists
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $rules['parent_category_id'] = ['nullable', 'exists:categories,category_id', 'prohibited_if:is_parent,1'];
            $rules['is_parent'] = ['boolean'];
        } else {
            $rules['parent_category_id'] = ['nullable', 'exists:categories,category_id'];
        }

        return $rules;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('category_name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Str::slug($this->category_name)
            ]);
        }
    }
}