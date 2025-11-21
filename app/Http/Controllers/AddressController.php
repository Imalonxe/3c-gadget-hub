<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $addresses = auth()->user()->addresses()->get();
        return Inertia::render('User/Addresses/Index', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user already has 5 addresses
        $addressCount = Address::where('user_id', auth()->id())->count();
        if ($addressCount >= 5) {
            return redirect()->back()->withErrors([
                'address_limit' => 'You can only save up to 5 addresses. Please delete an existing address first.'
            ]);
        }

        $data = $request->validate([
            'address_type' => 'nullable|in:shipping,billing',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'address_line1' => 'required|string|max:1000',
            'district' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean'
        ]);

        // Ensure user_id is set
        $data['user_id'] = auth()->id();
        $data['address_type'] = $data['address_type'] ?? 'shipping';

        // If setting default, clear other defaults
        if (!empty($data['is_default'])) {
            Address::where('user_id', auth()->id())->update(['is_default' => false]);
        }

        Address::create($data);

        return redirect()->back()->with('success', 'Address saved.');
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'address_type' => 'nullable|in:shipping,billing',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'address_line1' => 'required|string|max:1000',
            'district' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean'
        ]);

        if (!empty($data['is_default'])) {
            Address::where('user_id', auth()->id())->update(['is_default' => false]);
        }

        $address->update($data);

        return redirect()->back()->with('success', 'Address updated.');
    }

    public function destroy(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            abort(403);
        }

        $address->delete();

        return redirect()->back()->with('success', 'Address removed.');
    }

    /**
     * Set an address as default (AJAX-friendly)
     */
    public function setDefault(Address $address)
    {
        if ($address->user_id !== auth()->id()) {
            abort(403);
        }

        Address::where('user_id', auth()->id())->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return redirect()->back()->with('success', 'Default address updated.');
    }
}
