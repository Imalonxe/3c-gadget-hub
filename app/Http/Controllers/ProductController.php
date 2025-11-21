<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Category;
use App\Models\Attribute;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the products in admin panel.
     */
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with(['category', 'images' => function($query) {
                $query->primary();
            }])
            ->when($request->category_id, function($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->search, function($query, $search) {
                // products table stores the product title in `product_name`
                $query->where(function($q) use ($search) {
                    $q->where('product_name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function($query, $status) {
                if ($status === 'active') {
                    $query->active();
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category_id', 'status'])
        ]);
    }

    /**
     * Display a listing of the products in store frontend.
     */
    public function productList(Request $request): Response
    {
        $products = Product::query()
            ->active()
            ->with([
                'images' => function($query) {
                    $query->primary();
                },
                'attributeValues.attribute'
            ])
            ->when($request->category_id, function($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->search, function($query, $search) {
                // use product_name column for frontend search as well
                $query->where(function($q) use ($search) {
                    $q->where('product_name', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%");
                });
            })
            ->when($request->input('attributes'), function($query, $attributes) {
                $query->filterByAttributes($attributes);
            })
            ->when($request->filled(['min_price', 'max_price']), function($query) use ($request) {
                $query->filterByPrice(
                    $request->float('min_price'),
                    $request->float('max_price')
                );
            })
            ->when($request->brands, function($query, $brands) {
                $query->filterByBrand($brands);
            })
            ->when($request->availability, function($query, $availability) {
                $query->filterByAvailability($availability);
            })
            ->sortBy($request->input('sort', 'latest'))
            ->latest()
            ->get();

        $attributes = Attribute::with('values')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(function ($attribute) {
                return [
                    'id' => $attribute->id,
                    'display_name' => $attribute->display_name,
                    'type' => $attribute->filter_type,
                    'values' => $attribute->values->map(function ($value) {
                        return [
                            'id' => $value->id,
                            'display_value' => $value->display_value,
                            'color_code' => $value->color_code
                        ];
                    })
                ];
            });

        // Get unique brands from products. Try a simple DB query first for speed
        // but fall back to extracting from the already-loaded $products collection
        // if something unexpected happens (old DB, missing column, etc.).
        try {
            $brands = \Illuminate\Support\Facades\DB::table('products')
                ->where('is_active', true)
                ->whereNotNull('brand')
                ->distinct()
                ->pluck('brand')
                ->filter()
                ->values()
                ->toArray();
        } catch (\Throwable $e) {
            // Fallback: collect brands from the $products Eloquent collection we already loaded.
            $brands = collect($products)
                ->pluck('brand')
                ->filter()
                ->unique()
                ->values()
                ->toArray();
        }

        return Inertia::render('ProductsList', [
            'products' => $products,
            'attributes' => $attributes,
            'brands' => $brands
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => $this->getCategoryList()
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        // Handle product images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_url' => $path,
                    'is_primary' => $index === 0,
                    'display_order' => $index + 1
                ]);
            }
        }

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        $product->load(['category', 'images', 'reviews' => function($query) {
            $query->with(['user', 'images'])->latest();
        }]);

        return Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $product->load('images');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $this->getCategoryList()
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        // Handle existing images update (is_primary, etc.)
        if ($request->has('existing_images')) {
            // The incoming 'existing_images' may be a JSON-encoded string or already an array
            $existingImagesInput = $request->input('existing_images');

            if (is_string($existingImagesInput)) {
                $existingImages = json_decode($existingImagesInput, true);
            } elseif (is_array($existingImagesInput)) {
                $existingImages = $existingImagesInput;
            } else {
                $existingImages = null;
            }

            if (is_array($existingImages)) {
                foreach ($existingImages as $imageData) {
                    if (!isset($imageData['image_id'])) {
                        continue;
                    }

                    $product->images()->where('image_id', $imageData['image_id'])->update([
                        'is_primary' => $imageData['is_primary'] ?? false,
                    ]);
                }
            }
        }

        // Handle new product images upload
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_url' => $path,
                    'is_primary' => $index === 0 && !$product->images()->primary()->exists(),
                    'display_order' => $product->images()->count() + $index + 1
                ]);
            }
        }

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Check if product can be deleted (no orders)
        if ($product->orders()->exists()) {
            return back()->with('error', 'Cannot delete product with associated orders.');
        }

        // Delete product images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_url);
        }
        $product->images()->delete();
        
        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Toggle product active status.
     */
    public function toggleActive(Product $product)
    {
        $product->update([
            'is_active' => !$product->is_active
        ]);

        return back()->with('success', 
            $product->is_active ? 'Product activated successfully.' : 'Product deactivated successfully.'
        );
    }

    /**
     * Toggle product featured status.
     */
    public function toggleFeatured(Product $product)
    {
        $product->update([
            'is_featured' => !$product->is_featured
        ]);

        return back()->with('success', 
            $product->is_featured ? 'Product featured successfully.' : 'Product unfeatured successfully.'
        );
    }

    /**
     * Get formatted category list for select inputs.
     */
    private function getCategoryList()
    {
        // If the `is_parent` column exists, exclude parent categories from product selects
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $query = Category::query()->active()->where('is_parent', false)->ordered();
        } else {
            $query = Category::query()->active()->ordered();
        }

        return $query->get()->map(function ($category) {
            return [
                'category_id' => $category->category_id,
                'category_name' => $category->category_name,
                'is_parent' => $category->is_parent ?? false,
            ];
        });
    }
}