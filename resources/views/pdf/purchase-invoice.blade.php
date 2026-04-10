<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Invoice {{ $purchase->invoice_no }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; margin: 28px; }
        .header, .meta, .summary { width: 100%; }
        .header td { vertical-align: top; }
        .logo { width: 72px; height: 72px; object-fit: contain; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 6px; }
        .muted { color: #64748b; }
        .section { margin-top: 24px; }
        .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.items th, table.items td { border: 1px solid #cbd5e1; padding: 8px 10px; }
        table.items th { background: #e2e8f0; text-align: left; }
        .text-right { text-align: right; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: bold; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-partial { background: #fef3c7; color: #92400e; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 24px; font-size: 11px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    @php
        $dueAmount = max((float) $purchase->total_amount - (float) $purchase->paid_amount, 0);
        $totalQuantity = $purchase->items->sum('quantity');
        $statusClass = match($purchase->payment_status) {
            'paid' => 'status-paid',
            'partial' => 'status-partial',
            default => 'status-unpaid',
        };
    @endphp

    <table class="header">
        <tr>
            <td style="width: 90px;">
                @if(!empty($company['logo_path']))
                    <img src="{{ $company['logo_path'] }}" alt="Logo" class="logo">
                @endif
            </td>
            <td>
                <div class="title">{{ $company['name'] }}</div>
                <div class="muted">Purchase Invoice</div>
            </td>
            <td class="text-right">
                <div><strong>Invoice No:</strong> {{ $purchase->invoice_no }}</div>
                <div><strong>Purchase Date:</strong> {{ \Illuminate\Support\Carbon::parse($purchase->purchase_date)->timezone($displayTimezone)->format('d M Y') }}</div>
                <div><strong>Generated:</strong> {{ $generatedAt->format('d M Y h:i A') }}</div>
            </td>
        </tr>
    </table>

    <div class="section card">
        <table class="meta">
            <tr>
                <td style="width: 50%;">
                    <strong>Supplier</strong><br>
                    {{ $purchase->supplier_name ?? 'Unknown supplier' }}<br>
                    <span class="muted">Notes: {{ $purchase->notes ?: 'N/A' }}</span>
                </td>
                <td class="text-right">
                    <strong>Status</strong><br>
                    <span class="status {{ $statusClass }}">{{ ucfirst($purchase->payment_status) }}</span><br><br>
                    <strong>Paid:</strong> {{ number_format((float) $purchase->paid_amount, 2) }}<br>
                    <strong>Due:</strong> {{ number_format($dueAmount, 2) }}
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <strong>Items</strong>
        <table class="items">
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Product</th>
                    <th>Variant</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Line Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($purchase->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->product?->name ?? 'N/A' }}</td>
                        <td>{{ $item->productVariant?->attributeValue?->name ?? 'Standard' }}</td>
                        <td class="text-right">{{ number_format((float) $item->buying_price, 2) }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format((float) $item->total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section card">
        <table class="summary">
            <tr>
                <td><strong>Total quantity</strong></td>
                <td class="text-right">{{ $totalQuantity }}</td>
            </tr>
            <tr>
                <td><strong>Total amount</strong></td>
                <td class="text-right">{{ number_format((float) $purchase->total_amount, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Paid amount</strong></td>
                <td class="text-right">{{ number_format((float) $purchase->paid_amount, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Due amount</strong></td>
                <td class="text-right">{{ number_format($dueAmount, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Generated from Inventory Pro on {{ $generatedAt->format('d M Y h:i A') }}
    </div>
</body>
</html>
