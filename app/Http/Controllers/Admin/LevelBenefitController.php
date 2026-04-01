<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LevelBenefit;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Traits\LogsActivity;

class LevelBenefitController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $benefits = LevelBenefit::orderBy('level')->get();

        return Inertia::render('Admin/LevelBenefits/Index', [
            'benefits' => $benefits
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'level' => 'required|integer|unique:level_benefits,level|min:1',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'free_shipping' => 'boolean',
            'free_shipping_limit' => 'nullable|integer|min:1',
            'custom_benefits' => 'nullable|array'
        ]);

        $benefit = LevelBenefit::create($request->all());

        $this->logActivity('create_level_benefit', [
            'level' => $benefit->level,
            'discount_percentage' => $benefit->discount_percentage
        ]);

        return redirect()->back()->with('success', 'Level benefit created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LevelBenefit $levelBenefit)
    {
        $request->validate([
            'level' => 'required|integer|min:1|unique:level_benefits,level,' . $levelBenefit->id,
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'free_shipping' => 'boolean',
            'free_shipping_limit' => 'nullable|integer|min:1',
            'custom_benefits' => 'nullable|array'
        ]);

        $levelBenefit->update($request->all());

        $this->logActivity('update_level_benefit', [
            'level' => $levelBenefit->level,
            'changes' => $levelBenefit->getChanges()
        ]);

        return redirect()->back()->with('success', 'Level benefit updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LevelBenefit $levelBenefit)
    {
        $level = $levelBenefit->level;
        $levelBenefit->delete();

        $this->logActivity('delete_level_benefit', [
            'level' => $level
        ]);

        return redirect()->back()->with('success', 'Level benefit deleted successfully.');
    }
}
