<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($this->product, 'product_id')
            ],
            'description' => ['required', 'string'],
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($this->product, 'product_id')
            ],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'specifications' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:2048'], // 2MB limit
            'existing_images' => ['nullable', 'array'],
        ];

        // Category rule: prevent assigning to parent categories when is_parent column exists
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $rules['category_id'] = ['required', Rule::exists('categories', 'category_id')->where('is_parent', false)];
        } else {
            $rules['category_id'] = ['required', 'exists:categories,category_id'];
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
            'specifications.required' => 'Product specifications are required.',
            'specifications.*.required' => 'Each specification field must be filled.',
            'images.*.image' => 'Uploaded files must be images.',
            'images.*.max' => 'Image size should not exceed 2MB.',
            'sale_price.lt' => 'Sale price must be less than regular price.',
        ];
    }
}