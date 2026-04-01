<?php

namespace App\Http\Controllers;

use App\Models\PriceAlert;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogsActivity;

class PriceAlertController extends Controller
{
    use LogsActivity;
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'target_price' => 'nullable|numeric|min:0',
        ]);

        $product = Product::findOrFail($request->product_id);

        PriceAlert::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'initial_price' => $product->price,
            'target_price' => $request->target_price,
            'status' => 'active',
        ]);

        $this->logActivity('create_price_alert', [
            'product_id' => $request->product_id,
            'target_price' => $request->target_price
        ]);

        return back()->with('success', 'Price alert set successfully!');
    }

    public function destroy(PriceAlert $priceAlert)
    {
        if ($priceAlert->user_id !== Auth::id()) {
            abort(403);
        }

        $priceAlert->delete();

        $this->logActivity('delete_price_alert', [
            'alert_id' => $priceAlert->id,
            'product_id' => $priceAlert->product_id
        ]);

        return back()->with('success', 'Price alert removed.');
    }
}
