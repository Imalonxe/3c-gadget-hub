<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\LogsActivity;

class MissionController extends Controller
{
    use LogsActivity;
    public function index()
    {
        $missions = Mission::with('slots.category')->latest()->get();
        return Inertia::render('Admin/Missions/Index', [
            'missions' => $missions,
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('Admin/Missions/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'status' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'ab_group' => 'required|in:A,B,none',
            'slots' => 'required|array|min:1',
            'slots.*.category_id' => 'required|exists:categories,category_id',
        ]);

        $mission = Mission::create($request->only([
            'name', 'description', 'discount_type', 'discount_value', 'status', 'start_date', 'end_date', 'ab_group'
        ]));

        foreach ($request->slots as $index => $slot) {
            $mission->slots()->create([
                'category_id' => $slot['category_id'],
                'slot_order' => $index + 1,
            ]);
        }

        $this->logActivity('create_mission', [
            'mission_id' => $mission->id,
            'name' => $mission->name
        ]);

        return redirect()->route('admin.missions.index')->with('success', 'Mission created successfully.');
    }

    public function edit(Mission $mission)
    {
        $mission->load('slots');
        $categories = Category::all();
        return Inertia::render('Admin/Missions/Edit', [
            'mission' => $mission,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Mission $mission)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'status' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'ab_group' => 'required|in:A,B,none',
            'slots' => 'required|array|min:1',
            'slots.*.category_id' => 'required|exists:categories,category_id',
        ]);

        $mission->update($request->only([
            'name', 'description', 'discount_type', 'discount_value', 'status', 'start_date', 'end_date', 'ab_group'
        ]));

        // Sync slots: Delete existing and recreate (simple approach)
        $mission->slots()->delete();
        foreach ($request->slots as $index => $slot) {
            $mission->slots()->create([
                'category_id' => $slot['category_id'],
                'slot_order' => $index + 1,
            ]);
        }

        $this->logActivity('update_mission', [
            'mission_id' => $mission->id,
            'name' => $mission->name,
            'changes' => $mission->getChanges()
        ]);

        return redirect()->route('admin.missions.index')->with('success', 'Mission updated successfully.');
    }

    public function destroy(Mission $mission)
    {
        $mission->delete();

        $this->logActivity('delete_mission', [
            'mission_id' => $mission->id,
            'name' => $mission->name
        ]);

        return redirect()->route('admin.missions.index')->with('success', 'Mission deleted successfully.');
    }
}
