<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'product_name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'specifications' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => [
                'image',
                'mimes:jpeg,png,jpg,gif,webp', // Restrict to safe image formats
                'max:5120', // 5MB limit
                'dimensions:min_width=100,min_height=100' // Ensure it's a valid image with dimensions
            ],
        ];

        // If the categories table has the is_parent column, ensure selected category is not a parent
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $rules['category_id'] = ['nullable', Rule::exists('categories', 'category_id')->where('is_parent', false)];
        } else {
            // Migration not applied yet — fallback to simple exists rule
            $rules['category_id'] = ['nullable', 'exists:categories,category_id'];
        }

        return $rules;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('product_name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Str::slug($this->product_name)
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.*.image' => 'Uploaded files must be images.',
            'images.*.max' => 'Image size should not exceed 5MB.',
        ];
    }
}