<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
                'category_name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('categories', 'category_name')->ignore($this->category)
                ],
                'slug' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('categories', 'slug')->ignore($this->category)
                ],
                'description' => ['nullable', 'string'],
                'image_url' => ['nullable', 'string', 'max:255'],
                'is_active' => ['boolean'],
                'is_featured' => ['boolean'],
                'display_order' => ['nullable', 'integer', 'min:0'],
            ];

            if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
                $rules['parent_category_id'] = [
                    'nullable',
                    'exists:categories,category_id',
                    Rule::notIn([$this->category->category_id]), // Prevent self-reference
                    'prohibited_if:is_parent,1'
                ];
                $rules['is_parent'] = ['boolean'];
            } else {
                $rules['parent_category_id'] = [
                    'nullable',
                    'exists:categories,category_id',
                    Rule::notIn([$this->category->category_id]) // Prevent self-reference
                ];
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

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // If the request is attempting to set this category as a parent,
            // ensure it doesn't already contain products.
            if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent') && $this->filled('is_parent') && $this->boolean('is_parent')) {
                $category = $this->route('category');
                if ($category && $category->products()->exists()) {
                    $validator->errors()->add('is_parent', 'Cannot mark category as parent while it contains products.');
                }
            }
        });
    }
}