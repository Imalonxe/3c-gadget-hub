<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->with('parent')
            ->withCount('children', 'products')
            ->ordered()
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        $parentCategoriesQuery = Category::query();
        // If the DB has the is_parent column, only allow categories explicitly
        // marked as parents to be used as parent options. Otherwise fall back
        // to the previous behaviour (root categories by null parent).
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $parentCategoriesQuery->where('is_parent', true);
        } else {
            $parentCategoriesQuery->whereNull('parent_category_id');
        }

        $parentCategories = $parentCategoriesQuery->ordered()->get();

        return Inertia::render('Admin/Categories/Create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        // If the DB migration hasn't been applied, remove is_parent to avoid SQL errors
        if (!\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            unset($data['is_parent']);
        }

        // Normalize empty parent value to null so DB stores NULL for root categories
        if (array_key_exists('parent_category_id', $data) && $data['parent_category_id'] === '') {
            $data['parent_category_id'] = null;
        }

        $category = Category::create($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): Response
    {
        $category->load(['parent', 'children', 'products']);

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category): Response
    {
        $parentCategoriesQuery = Category::query();
        // Prefer categories explicitly marked as parents. If the column
        // doesn't exist yet, fall back to top-level categories (parent null).
        if (\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            $parentCategoriesQuery->where('is_parent', true);
        } else {
            $parentCategoriesQuery->whereNull('parent_category_id');
        }

        // Prevent selecting the current category as its own parent
        $parentCategoriesQuery->where('category_id', '!=', $category->category_id);

        $parentCategories = $parentCategoriesQuery->ordered()->get();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        if (!\Illuminate\Support\Facades\Schema::hasColumn('categories', 'is_parent')) {
            unset($data['is_parent']);
        }

        // Normalize empty parent value to null so DB stores NULL for root categories
        if (array_key_exists('parent_category_id', $data) && $data['parent_category_id'] === '') {
            $data['parent_category_id'] = null;
        }

        $category->update($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has children, products, or coupons
        if ($category->children()->exists() || $category->products()->exists() || $category->coupons()->exists()) {
            return back()->with('error', 'Cannot delete category with associated children, products, or coupons.');
        }

        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Update display order of categories.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            // request payload uses 'id' for each category item but the DB primary key
            // column is `category_id` so validate against that column.
            'categories.*.id' => 'required|exists:categories,category_id',
            'categories.*.display_order' => 'required|integer|min:0'
        ]);

        foreach ($request->categories as $categoryData) {
            // Update by the actual column name
            Category::where('category_id', $categoryData['id'])
                ->update(['display_order' => $categoryData['display_order']]);
        }

        return response()->json(['message' => 'Category order updated successfully']);
    }

    /**
     * Toggle category active status.
     */
    public function toggleActive(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        return back()->with('success', 
            $category->is_active ? 'Category activated successfully.' : 'Category deactivated successfully.'
        );
    }

    /**
     * Toggle category featured status.
     */
    public function toggleFeatured(Category $category)
    {
        $category->update([
            'is_featured' => !$category->is_featured
        ]);

        return back()->with('success', 
            $category->is_featured ? 'Category featured successfully.' : 'Category unfeatured successfully.'
        );
    }
}