<!DOCTYPE html>
<html lang="th">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Shipping Label - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'notosansthai', 'garuda', sans-serif;
            font-size: 20px;
            line-height: 1.2;
            color: #000;
        }
        .container {
            border: 2px solid #000;
            padding: 20px;
            height: 95%;
            position: relative;
        }
        .sender-box {
            margin-bottom: 20px;
        }
        .receiver-box {
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 30px;
        }
        .order-id {
            float: right;
            font-weight: bold;
            font-size: 24px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .items-table th {
            text-align: left;
            font-weight: bold;
            border-bottom: 1px solid #000; /* Optional: remove if strict adherence to image */
        }
        .items-table td {
            vertical-align: top;
            padding: 5px 0;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            color: #666;
        }
        .footer-left {
            float: left;
        }
        .footer-right {
            float: right;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sender Info -->
        <div class="sender-box">
            <strong>ผู้ส่ง: 3C-Gadget-Hub</strong><br>
            เลขที่ 88 หมู่ 4 ตำบลคลองหนึ่ง อำเภอคลองหลวง<br>
            จังหวัดปทุมธานี 12120 (082-927-6498)
        </div>

        <!-- Receiver Info -->
        <div class="receiver-box">
            <div class="clearfix">
                <span class="order-id">#{{ $order->order_id }}</span>
                <strong>ผู้รับ: {{ $order->shipping_address ? $order->shipping_address->full_name : ($order->user->name ?? 'N/A') }}</strong>
            </div>
            <div style="margin-top: 10px;">
                @if($order->shipping_address)
                    {{ $order->shipping_address->address }}<br>
                    {{ $order->shipping_address->district }} {{ $order->shipping_address->province }} {{ $order->shipping_address->postal_code }}<br>
                    ({{ $order->shipping_address->phone }})
                @else
                    ที่อยู่ไม่ระบุ
                @endif
            </div>
        </div>

        <!-- Items List -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 65%;">ชื่อสินค้า</th>
                    <th style="width: 15%; text-align: center;">จำนวน</th>
                    <th style="width: 15%; text-align: right;">ราคา</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}.</td>
                    <td>{{ $item->product_name ?? $item->product->product_name }}</td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td style="text-align: right;">{{ number_format($item->unit_price ?? $item->price ?? 0, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Footer -->
        <div class="footer clearfix">
            <div class="footer-left">
                Print Time: {{ \Carbon\Carbon::now('Asia/Bangkok')->addYears(543)->format('d F Y H:i น.') }}
            </div>
            <div class="footer-right">
                Thank you for your purchase <span style="color: #2ecc71; font-weight: bold;">3C-Gadget-Hub</span>
            </div>
        </div>
    </div>
</body>
</html>
