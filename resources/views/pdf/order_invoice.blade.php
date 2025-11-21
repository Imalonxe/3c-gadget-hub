<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invoice {{ $order->order_number }}</title>
        <style>
            /*
                To render Thai characters correctly in DOMPDF you must provide a Thai-capable TTF file.
                Place a TTF (for example: NotoSansThai-Regular.ttf or THSarabunNew.ttf) in the public/fonts
                directory and name it "NotoSansThai-Regular.ttf" (or update the filename below).

                DOMPDF can load local files via an absolute path. We create a file:// URL using public_path()
                and normalize backslashes to forward slashes so it works on Windows.
            */
            /*
                We register the Thai-capable font with mPDF (from public/fonts) and set a font-family
                that mPDF will resolve. Do NOT embed the font as a data: URI here — that can break
                mPDF's charset detection. Ensure NotoSansThai-Regular.ttf exists in public/fonts.
            */

            /* Ensure mPDF uses a Thai-capable font first (garuda) then Noto as fallback, then DejaVu/Arial */
            body { font-family: garuda, notosansthai, DejaVu Sans, Arial, sans-serif; color: #222; }
            h1, h2, h3, h4, h5, h6, p, div, span, strong, table, th, td { font-family: garuda, notosansthai, DejaVu Sans, Arial, sans-serif; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px }
            .items { width:100%; border-collapse: collapse; margin-top:20px }
            .items th, .items td { border: 1px solid #ddd; padding:8px }
            .items th { background: #f7f7f7; }
            .totals { margin-top: 20px; float: right; }
            .small { font-size: 12px; color:#666 }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div>
                    <h2>Invoice</h2>
                    <div class="small">Order: {{ $order->order_number }}</div>
                    <div class="small">Date: {{ $order->created_at->format('F j, Y H:i') }}</div>
                </div>
                <div>
                    <strong>Shop Name</strong>
                    <div class="small">123 Example St</div>
                </div>
            </div>

            <div style="margin-top:10px;">
                <strong>Bill to:</strong>
                <div>{{ $order->user->name ?? 'N/A' }}</div>
                <div class="small">{{ $order->user->email ?? '' }}</div>
            </div>

            <table class="items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->product->product_name ?? ($item->name ?? 'Product') }}</td>
                            <td style="text-align:center">{{ $item->quantity }}</td>
                            <td style="text-align:right">${{ number_format($item->unit_price ?? $item->price ?? 0, 2) }}</td>
                            <td style="text-align:right">${{ number_format(($item->unit_price ?? $item->price ?? 0) * $item->quantity, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="totals">
                <div>Subtotal: ${{ number_format($order->subtotal ?? 0, 2) }}</div>
                <div>Shipping: ${{ number_format($order->shipping_fee ?? 0, 2) }}</div>
                <div>Tax: ${{ number_format($order->tax ?? 0, 2) }}</div>
                <div><strong>Total: ${{ number_format($order->total_amount ?? 0, 2) }}</strong></div>
            </div>

            <div style="clear:both; margin-top:40px;" class="small">
                Thank you for your purchase.
            </div>
        </div>
    </body>
</html>
