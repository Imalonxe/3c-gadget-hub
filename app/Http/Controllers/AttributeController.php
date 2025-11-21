<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributeController extends Controller
{
    /**
     * Display a listing of the attributes.
     */
    public function index()
    {
        $attributes = Attribute::with(['category', 'values'])
            ->orderBy('position')
            ->paginate(10);

        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes
        ]);
    }

    /**
     * Show the form for creating a new attribute.
     */
    public function create()
    {
        return Inertia::render('Admin/Attributes/Create', [
            'categories' => Category::all(),
            'types' => [
                'select' => 'Dropdown Selection',
                'radio' => 'Radio Buttons',
                'checkbox' => 'Checkboxes',
                'color' => 'Color Swatch'
            ]
        ]);
    }

    /**
     * Store a newly created attribute in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:attributes',
            'display_name' => 'required|string|max:255',
            'type' => 'required|in:select,radio,checkbox,color',
            'is_filterable' => 'boolean',
            'is_required' => 'boolean',
            'category_id' => 'nullable|exists:categories,category_id',
            'values' => 'required|array|min:1',
            'values.*.value' => 'required|string|max:255',
            'values.*.display_value' => 'required|string|max:255',
            'values.*.color_code' => 'required_if:type,color|nullable|string|max:7'
        ]);

        $attribute = Attribute::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'type' => $validated['type'],
            'is_filterable' => $validated['is_filterable'],
            'is_required' => $validated['is_required'],
            'category_id' => $validated['category_id'],
            'position' => Attribute::max('position') + 1
        ]);

        foreach ($validated['values'] as $index => $valueData) {
            $attribute->values()->create([
                'value' => $valueData['value'],
                'display_value' => $valueData['display_value'],
                'color_code' => $valueData['color_code'] ?? null,
                'position' => $index
            ]);
        }

        return redirect()->route('admin.attributes.index')
            ->with('success', 'Attribute created successfully.');
    }

    /**
     * Show the form for editing the specified attribute.
     */
    public function edit(Attribute $attribute)
    {
        return Inertia::render('Admin/Attributes/Edit', [
            'attribute' => $attribute->load('values'),
            'categories' => Category::all(),
            'types' => [
                'select' => 'Dropdown Selection',
                'radio' => 'Radio Buttons',
                'checkbox' => 'Checkboxes',
                'color' => 'Color Swatch'
            ]
        ]);
    }

    /**
     * Update the specified attribute in storage.
     */
    public function update(Request $request, Attribute $attribute)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name,' . $attribute->id,
            'display_name' => 'required|string|max:255',
            'type' => 'required|in:select,radio,checkbox,color',
            'is_filterable' => 'boolean',
            'is_required' => 'boolean',
            'category_id' => 'nullable|exists:categories,category_id',
            'values' => 'required|array|min:1',
            'values.*.id' => 'nullable|exists:attribute_values,id',
            'values.*.value' => 'required|string|max:255',
            'values.*.display_value' => 'required|string|max:255',
            'values.*.color_code' => 'required_if:type,color|nullable|string|max:7'
        ]);

        $attribute->update([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'type' => $validated['type'],
            'is_filterable' => $validated['is_filterable'],
            'is_required' => $validated['is_required'],
            'category_id' => $validated['category_id']
        ]);

        // Keep track of value IDs to delete removed ones
        $existingValueIds = $attribute->values->pluck('id')->toArray();
        $newValueIds = [];

        foreach ($validated['values'] as $index => $valueData) {
            if (isset($valueData['id'])) {
                // Update existing value
                $attribute->values()->where('id', $valueData['id'])->update([
                    'value' => $valueData['value'],
                    'display_value' => $valueData['display_value'],
                    'color_code' => $valueData['color_code'] ?? null,
                    'position' => $index
                ]);
                $newValueIds[] = $valueData['id'];
            } else {
                // Create new value
                $newValue = $attribute->values()->create([
                    'value' => $valueData['value'],
                    'display_value' => $valueData['display_value'],
                    'color_code' => $valueData['color_code'] ?? null,
                    'position' => $index
                ]);
                $newValueIds[] = $newValue->id;
            }
        }

        // Delete removed values
        $valuesToDelete = array_diff($existingValueIds, $newValueIds);
        $attribute->values()->whereIn('id', $valuesToDelete)->delete();

        return redirect()->route('admin.attributes.index')
            ->with('success', 'Attribute updated successfully.');
    }

    /**
     * Remove the specified attribute from storage.
     */
    public function destroy(Attribute $attribute)
    {
        $attribute->delete();

        return redirect()->route('admin.attributes.index')
            ->with('success', 'Attribute deleted successfully.');
    }

    /**
     * Update the positions of attributes.
     */
    public function updatePositions(Request $request)
    {
        $validated = $request->validate([
            'positions' => 'required|array',
            'positions.*' => 'required|exists:attributes,id'
        ]);

        foreach ($validated['positions'] as $index => $id) {
            Attribute::where('id', $id)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Positions updated successfully.']);
    }

    /**
     * Get filterable attributes for a category.
     */
    public function getFilterableAttributes($categoryId)
    {
        $attributes = Attribute::with('values')
            ->filterable()
            ->where(function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId)
                    ->orWhereNull('category_id');
            })
            ->orderBy('position')
            ->get();

        return response()->json($attributes);
    }
}