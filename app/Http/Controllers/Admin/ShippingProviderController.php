<?php

namespace App\Http\Controllers\Admin;

use App\Models\ShippingProvider;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Traits\LogsActivity;

class ShippingProviderController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of the shipping providers.
     */
    public function index()
    {
        $providers = ShippingProvider::orderBy('sort_order')->orderBy('name')->get();
        
        return Inertia::render('Admin/ShippingProviders/Index', [
            'providers' => $providers,
        ]);
    }

    /**
     * Show the form for creating a new shipping provider.
     */
    public function create()
    {
        return Inertia::render('Admin/ShippingProviders/Create');
    }

    /**
     * Store a newly created shipping provider in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shipping_providers,code',
            'base_fee' => 'required|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $provider = ShippingProvider::create($validated);

        $this->logActivity('create_shipping_provider', [
            'provider_id' => $provider->id,
            'name' => $provider->name,
            'code' => $provider->code
        ]);

        return redirect()->route('admin.shipping-providers.index')
            ->with('success', 'Shipping provider created successfully.');
    }

    /**
     * Display the specified shipping provider.
     */
    public function show(ShippingProvider $shippingProvider)
    {
        return Inertia::render('Admin/ShippingProviders/Show', [
            'provider' => $shippingProvider,
        ]);
    }

    /**
     * Show the form for editing the specified shipping provider.
     */
    public function edit(ShippingProvider $shippingProvider)
    {
        return Inertia::render('Admin/ShippingProviders/Edit', [
            'provider' => $shippingProvider,
        ]);
    }

    /**
     * Update the specified shipping provider in storage.
     */
    public function update(Request $request, ShippingProvider $shippingProvider)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shipping_providers,code,' . $shippingProvider->id,
            'base_fee' => 'required|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $shippingProvider->update($validated);

        $this->logActivity('update_shipping_provider', [
            'provider_id' => $shippingProvider->id,
            'name' => $shippingProvider->name,
            'changes' => $shippingProvider->getChanges()
        ]);

        return redirect()->route('admin.shipping-providers.index')
            ->with('success', 'Shipping provider updated successfully.');
    }

    /**
     * Remove the specified shipping provider from storage.
     */
    public function destroy(ShippingProvider $shippingProvider)
    {
        $shippingProvider->delete();

        $this->logActivity('delete_shipping_provider', [
            'provider_id' => $shippingProvider->id,
            'name' => $shippingProvider->name
        ]);

        return redirect()->route('admin.shipping-providers.index')
            ->with('success', 'Shipping provider deleted successfully.');
    }

    /**
     * Toggle the active status of a shipping provider.
     */
    public function toggleActive(ShippingProvider $shippingProvider)
    {
        $shippingProvider->update([
            'is_active' => !$shippingProvider->is_active
        ]);

        $this->logActivity('toggle_shipping_provider_active', [
            'provider_id' => $shippingProvider->id,
            'name' => $shippingProvider->name,
            'is_active' => $shippingProvider->is_active
        ]);

        return back()->with('success', 'Shipping provider status updated.');
    }

    /**
     * Update the order of shipping providers.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'providers' => 'required|array',
            'providers.*.id' => 'required|exists:shipping_providers,id',
            'providers.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->providers as $providerData) {
            ShippingProvider::where('id', $providerData['id'])
                ->update(['sort_order' => $providerData['sort_order']]);
        }

        $this->logActivity('update_shipping_provider_order', [
            'count' => count($request->providers)
        ]);

        return back()->with('success', 'Provider order updated successfully.');
    }
}
