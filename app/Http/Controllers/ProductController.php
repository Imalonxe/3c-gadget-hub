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

use App\Traits\LogsActivity;

class ProductController extends Controller
{
    use LogsActivity;
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
                // Escape search term to prevent XSS when reflected back to frontend
                // and ensure safe SQL query construction
                $safeSearch = htmlspecialchars($search, ENT_QUOTES, 'UTF-8');
                
                // products table stores the product title in `product_name`
                $query->where(function($q) use ($safeSearch) {
                    $q->where('product_name', 'like', "%{$safeSearch}%")
                      ->orWhere('sku', 'like', "%{$safeSearch}%")
                      ->orWhere('brand', 'like', "%{$safeSearch}%");
                });
            })
            ->when($request->status, function($query, $status) {
                if ($status === 'active') {
                    $query->active();
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->when($request->stock_status, function($query, $stockStatus) {
                if ($stockStatus === 'in_stock') {
                    $query->where('stock_quantity', '>', 10);
                } elseif ($stockStatus === 'low_stock') {
                    $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10);
                } elseif ($stockStatus === 'out_of_stock') {
                    $query->where('stock_quantity', '<=', 0);
                }
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category_id', 'status', 'stock_status']),
            'categories' => $this->getCategoryList(),
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

        $this->logActivity('create_product', [
            'product_id' => $product->product_id,
            'product_name' => $product->product_name,
            'sku' => $product->sku
        ]);

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
        // Debug: Log what we actually received
        \Log::info('ProductController::update() called', [
            'product_id' => $product->product_id,
            'post_data_count' => count($request->post()),
            'has_files' => $request->hasFile('images'),
            'files_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
            'all_input_keys' => array_keys($request->all()),
            'php_post_max_size' => ini_get('post_max_size'),
            'php_upload_max_filesize' => ini_get('upload_max_filesize'),
        ]);
        
        // Check if POST data was lost due to file size exceeding PHP limits
        // When post_max_size or upload_max_filesize is exceeded, $_POST is empty but $_FILES may have data
        $hasFiles = $request->hasFile('images');
        $postDataCount = count($request->post());
        
        // If we have files but almost no POST data, PHP likely truncated the request
        if ($hasFiles && $postDataCount < 5) {
            \Log::warning('POST data appears empty with files present - PHP limits likely exceeded', [
                'post_count' => $postDataCount,
                'files_count' => count($request->file('images') ?? [])
            ]);
            return back()->with('error', 
                'Upload failed: POST data was truncated. Check server PHP limits (post_max_size, upload_max_filesize).'
            );
        }

        // Update product fields only if POST data is complete (no files, or files within limits)
        if (!$hasFiles || $postDataCount >= 5) {
            $validated = $request->validated();
            
            // Remove image-related fields from validation to avoid required errors
            $fieldsToUpdate = [
                'product_name', 'slug', 'description', 'brand', 'model', 'sku', 
                'price', 'sale_price', 'stock_quantity', 'category_id', 
                'specifications', 'is_active', 'is_featured'
            ];
            
            $updateData = [];
            foreach ($fieldsToUpdate as $field) {
                if (isset($validated[$field])) {
                    $updateData[$field] = $validated[$field];
                }
            }
            
            $product->update($updateData);

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
                            'display_order' => $imageData['display_order'] ?? 0,
                        ]);
                    }
                }
            }

            // Handle deleted images
            if ($request->has('deleted_images')) {
                $deletedImagesInput = $request->input('deleted_images');
                $deletedImages = is_string($deletedImagesInput) ? json_decode($deletedImagesInput, true) : (is_array($deletedImagesInput) ? $deletedImagesInput : []);
                
                if (is_array($deletedImages) && count($deletedImages) > 0) {
                    foreach ($deletedImages as $imageId) {
                        $image = $product->images()->where('image_id', $imageId)->first();
                        if ($image) {
                            // Delete file from storage
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_url);
                            // Delete image record
                            $image->delete();
                        }
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

            $this->logActivity('update_product', [
                'product_id' => $product->product_id,
                'product_name' => $product->product_name,
                'changes' => $product->getChanges()
            ]);

            return redirect()
                ->route('admin.products.index')
                ->with('success', 'Product updated successfully!');
        }
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

        $this->logActivity('delete_product', [
            'product_id' => $product->product_id,
            'product_name' => $product->product_name
        ]);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Remove multiple products from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,product_id',
        ]);

        $ids = $request->input('ids');
        $deletedCount = 0;
        $failedCount = 0;

        foreach ($ids as $id) {
            $product = Product::find($id);
            
            if ($product) {
                // Check if product can be deleted (no orders)
                if ($product->orders()->exists()) {
                    $failedCount++;
                    continue;
                }

                // Delete product images
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image->image_url);
                }
                $product->images()->delete();
                
                $product->delete();
                $deletedCount++;
            }
        }

        if ($failedCount > 0) {
            return back()->with('warning', "Deleted {$deletedCount} products. {$failedCount} products could not be deleted because they have associated orders.");
        }

        $this->logActivity('bulk_delete_products', [
            'count' => $deletedCount,
            'ids' => $ids
        ]);

        return back()->with('success', "{$deletedCount} products deleted successfully.");
    }

    /**
     * Toggle product active status.
     */
    public function toggleActive(Product $product)
    {
        $product->update([
            'is_active' => !$product->is_active
        ]);

        $this->logActivity('toggle_product_active', [
            'product_id' => $product->product_id,
            'product_name' => $product->product_name,
            'is_active' => $product->is_active
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

        $this->logActivity('toggle_product_featured', [
            'product_id' => $product->product_id,
            'product_name' => $product->product_name,
            'is_featured' => $product->is_featured
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