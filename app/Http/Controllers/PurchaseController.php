<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $purchase_items = PurchaseItem::with(['purchase', 'product', 'productVariant.attributeValue.attribute'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->whereHas('product', function ($productQuery) use ($q) {
                        $productQuery->where('name', 'like', "%{$q}%");
                    })->orWhereHas('purchase', function ($purchaseQuery) use ($q) {
                        $purchaseQuery->where('invoice_no', 'like', "%{$q}%")
                            ->orWhere('supplier_name', 'like', "%{$q}%")
                            ->orWhere('payment_status', 'like', "%{$q}%");
                    });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchase/Index', [
            'purchase_items' => $purchase_items,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        $products = Product::with('variants.attributeValue.attribute')
            ->select('id', 'name', 'buying_price', 'stock', 'unit')
            ->get();
        return Inertia::render('Purchase/Create', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        // dd($request->all());

        $validated = $request->validate([
            'invoice_no' => 'nullable|string|max:255|unique:purchases,invoice_no',
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|string',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $items = $this->preparePurchaseItems(collect($validated['items']));
            $affectedVariantIds = [];
            $manualInvoiceNumber = trim((string) ($validated['invoice_no'] ?? ''));
            $invoice = $manualInvoiceNumber !== '' ? $manualInvoiceNumber : $this->generateUniquePurchaseInvoiceNumber();

            $purchase = Purchase::create([
                'invoice_no' => $invoice,
                'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                'notes' => $validated['notes'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'payment_status' => $validated['payment_status'],
                'total_amount' => 0,
                'paid_amount' => $validated['paid_amount'] ?? 0, // fallback to 0
            ]);

            $totalAmount = 0;

            foreach ($items as $item) {
                $lineTotal = $item['quantity'] * $item['buying_price'];
                $totalAmount += $lineTotal;

                $purchase->items()->create([
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant']->id,
                    'quantity' => $item['quantity'],
                    'buying_price' => $item['buying_price'],
                    'total' => $lineTotal,
                ]);

                $item['product']->incrementStockForVariant($item['variant']->id, (int) $item['quantity']);
                $item['variant']->update(['buying_price' => $item['buying_price']]);
                $affectedVariantIds[] = $item['variant']->id;

                if ($item['variant']->attribute_value_id === null) {
                    $item['product']->update(['buying_price' => $item['buying_price']]);
                }
            }

            ProductVariant::whereIn('id', array_unique($affectedVariantIds))
                ->get()
                ->each
                ->syncCostFromPurchaseHistory();

            // Update purchase totals AFTER calculating items
            $purchase->update([
                'total_amount' => $totalAmount,
                'paid_amount' => $validated['paid_amount'] ?? 0,
            ]);

            // dd($validated['paid_amount']);

            // Now paid_amount is guaranteed to exist
            Transaction::create([
                'name' => 'Product Purchase - ' . $purchase->invoice_no,
                'payment_method' => 'cash',
                'transaction_type' => 'expense',
                'source' => '',
                'destination' => $purchase->supplier_name,
                'amount' => $purchase->paid_amount, // safe now
            ]);
        });


        return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load('items.product', 'items.productVariant.attributeValue.attribute');
        $products = Product::with('variants.attributeValue.attribute')
            ->select('id', 'name', 'buying_price', 'stock', 'unit')
            ->get();
        return Inertia::render('Purchase/Edit', [
            'purchase' => $purchase,
            'products' => $products
        ]);
    }

    public function show(Purchase $purchase)
    {
        return Inertia::render('Purchase/Show', [
            'purchase' => $purchase->load('items.product', 'items.productVariant.attributeValue.attribute'),
        ]);
    }

    public function downloadInvoicePdf(Purchase $purchase)
    {
        $purchase->load('items.product', 'items.productVariant.attributeValue.attribute');

        $pdf = Pdf::loadView('pdf.purchase-invoice', [
            'purchase' => $purchase,
            'company' => $this->companyDetails(),
            'generatedAt' => now($this->localTimezone()),
            'displayTimezone' => $this->localTimezone(),
        ])->setPaper('a4');

        return $pdf->download("purchase-invoice-{$purchase->invoice_no}.pdf");
    }

    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|string',
            'paid_amount' => 'required|numeric|min:0', // this is the new payment entered
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $purchase) {
            $items = $this->preparePurchaseItems(collect($validated['items']));
            $affectedVariantIds = $purchase->items->pluck('product_variant_id')->filter()->values()->all();
            $totalAmount = 0;

            // Revert previous stock
            foreach ($purchase->items as $oldItem) {
                $oldItem->product->decrementStockForVariant($oldItem->product_variant_id, (int) $oldItem->quantity);
            }

            $purchase->items()->delete();

            // Add updated items
            foreach ($items as $item) {
                $lineTotal = $item['quantity'] * $item['buying_price'];
                $totalAmount += $lineTotal;

                $purchase->items()->create([
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant']->id,
                    'quantity' => $item['quantity'],
                    'buying_price' => $item['buying_price'],
                    'total' => $lineTotal,
                ]);

                $item['product']->incrementStockForVariant($item['variant']->id, (int) $item['quantity']);
                $item['variant']->update(['buying_price' => $item['buying_price']]);
                $affectedVariantIds[] = $item['variant']->id;

                if ($item['variant']->attribute_value_id === null) {
                    $item['product']->update(['buying_price' => $item['buying_price']]);
                }
            }

            ProductVariant::whereIn('id', array_unique($affectedVariantIds))
                ->get()
                ->each
                ->syncCostFromPurchaseHistory();

            // Calculate new cumulative paid amount
            $newPaid = $validated['paid_amount']; // new payment this edit
            $cumulativePaid = $purchase->paid_amount + $newPaid;

            $paymentStatus = $cumulativePaid >= $totalAmount ? 'paid' : 'partial';

            // Update purchase
            $purchase->update([
                'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                'notes' => $validated['notes'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'payment_status' => $paymentStatus,
                // 'payment_status' => $validated['payment_status'],
                'total_amount' => $totalAmount,
                'paid_amount' => $cumulativePaid, // cumulative paid amount
            ]);

            // Only create a transaction if new payment > 0
            if ($newPaid > 0) {
                Transaction::create([
                    'name' => 'Product Purchase - ' . $purchase->invoice_no,
                    'payment_method' => 'cash',
                    'transaction_type' => 'expense',
                    'source' => '',
                    'destination' => $purchase->supplier_name,
                    'amount' => $newPaid,
                ]);
            }
        });

        return redirect()->route('purchases.index')
            ->with('success', 'Purchase updated successfully.');
    }


    public function destroy(Purchase $purchase)
    {
        DB::transaction(function () use ($purchase) {
            $affectedVariantIds = $purchase->items->pluck('product_variant_id')->filter()->values()->all();
            foreach ($purchase->items as $item) {
                $item->product->decrementStockForVariant($item->product_variant_id, (int) $item->quantity);
            }

            $purchase->items()->delete();

            ProductVariant::whereIn('id', array_unique($affectedVariantIds))
                ->get()
                ->each
                ->syncCostFromPurchaseHistory();

            $purchase->delete();
        });

        return redirect()->route('purchases.index')->with('success', 'Purchase deleted successfully.');
    }

    protected function preparePurchaseItems($items)
    {
        $productIds = $items->pluck('product_id')->filter()->unique()->values();
        $variantIds = $items->pluck('product_variant_id')->filter()->unique()->values();

        $products = Product::with('variants.attributeValue.attribute')
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $variants = ProductVariant::with('attributeValue.attribute')
            ->whereIn('id', $variantIds)
            ->get()
            ->keyBy('id');

        return $items->map(function ($item) use ($products, $variants) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw new \RuntimeException('Selected product was not found.');
            }

            if (!empty($item['product_variant_id'])) {
                $variant = $variants->get((int) $item['product_variant_id']);

                if (!$variant || (int) $variant->product_id !== (int) $product->id) {
                    throw new \RuntimeException("Selected variant does not belong to {$product->name}.");
                }
            } else {
                $variant = $product->resolveVariant();

                if (!$variant && empty($product->attribute_id)) {
                    $variant = $product->ensureVariantlessVariant([
                        'buying_price' => (float) $item['buying_price'],
                        'average_cost' => (float) $item['buying_price'],
                    ]);
                }
            }

            if (!$variant) {
                throw new \RuntimeException("No stock variant is available for {$product->name}.");
            }

            return [
                'product' => $product,
                'variant' => $variant,
                'quantity' => (int) $item['quantity'],
                'buying_price' => (float) $item['buying_price'],
            ];
        });
    }

    protected function generateUniquePurchaseInvoiceNumber(): string
    {
        do {
            $invoice = 'INV-' . Str::upper(Str::random(6));
        } while (Purchase::where('invoice_no', $invoice)->exists());

        return $invoice;
    }

    protected function companyDetails(): array
    {
        $settings = Setting::whereIn('name', ['company_name', 'logo'])
            ->get()
            ->keyBy('name');

        $logoPath = null;
        if (!empty($settings['logo']?->value)) {
            $candidate = storage_path('app/public/' . $settings['logo']->value);
            if (file_exists($candidate)) {
                $logoPath = $candidate;
            }
        }

        return [
            'name' => $settings['company_name']?->value ?? config('app.name'),
            'logo_path' => $logoPath,
        ];
    }

    protected function localTimezone(): string
    {
        return 'Asia/Dhaka';
    }
}
