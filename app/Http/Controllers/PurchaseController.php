<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $purchase_items = PurchaseItem::with(['purchase', 'product'])
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
        $products = Product::query()->select('id', 'name', 'buying_price', 'stock')->orderBy('name')->get();
        return Inertia::render('Purchase/Create', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $invoice = 'INV-' . time();

                $totalAmount = 0;
                foreach ($validated['items'] as $item) {
                    $totalAmount += $item['quantity'] * $item['buying_price'];
                }

                $paidAmount = (float) $validated['paid_amount'];
                if ($paidAmount > $totalAmount) {
                    throw new \InvalidArgumentException('Paid amount cannot exceed total amount.');
                }

                $paymentStatus = $paidAmount <= 0
                    ? 'unpaid'
                    : ($paidAmount < $totalAmount ? 'partial' : 'paid');

                $purchase = Purchase::create([
                    'invoice_no' => $invoice,
                    'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                    'purchase_date' => $validated['purchase_date'],
                    'payment_status' => $paymentStatus,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                ]);

                foreach ($validated['items'] as $item) {
                    $lineTotal = $item['quantity'] * $item['buying_price'];

                    $purchase->items()->create([
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'buying_price' => $item['buying_price'],
                        'total' => $lineTotal,
                    ]);

                    $product = Product::find($item['product_id']);
                    $product->increment('stock', $item['quantity']);
                    $product->update(['buying_price' => $item['buying_price']]);
                }

                if ($paidAmount > 0) {
                    Transaction::create([
                        'name' => 'Product Purchase - ' . $purchase->invoice_no,
                        'payment_method' => 'cash',
                        'transaction_type' => 'expense',
                        'source' => $purchase->supplier_name,
                        'amount' => $paidAmount,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }


        return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load('items.product');
        $products = Product::query()->select('id', 'name', 'buying_price', 'stock')->orderBy('name')->get();
        return Inertia::render('Purchase/Edit', [
            'purchase' => $purchase,
            'products' => $products
        ]);
    }

    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated, $purchase) {
                $totalAmount = 0;

                // Revert previous stock
                foreach ($purchase->items as $oldItem) {
                    $product = Product::find($oldItem->product_id);
                    $product->decrement('stock', $oldItem->quantity);
                }

                $purchase->items()->delete();

                foreach ($validated['items'] as $item) {
                    $lineTotal = $item['quantity'] * $item['buying_price'];
                    $totalAmount += $lineTotal;

                    $purchase->items()->create([
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'buying_price' => $item['buying_price'],
                        'total' => $lineTotal,
                    ]);

                    $product = Product::find($item['product_id']);
                    $product->increment('stock', $item['quantity']);
                    $product->update(['buying_price' => $item['buying_price']]);
                }

                $newPaid = (float) $validated['paid_amount'];
                $cumulativePaid = $purchase->paid_amount + $newPaid;
                if ($cumulativePaid > $totalAmount) {
                    throw new \InvalidArgumentException('Paid amount cannot exceed total amount.');
                }

                $paymentStatus = $cumulativePaid <= 0
                    ? 'unpaid'
                    : ($cumulativePaid < $totalAmount ? 'partial' : 'paid');

                $purchase->update([
                    'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                    'purchase_date' => $validated['purchase_date'],
                    'payment_status' => $paymentStatus,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $cumulativePaid,
                ]);

                if ($newPaid > 0) {
                    Transaction::create([
                        'name' => 'Product Purchase - ' . $purchase->invoice_no,
                        'payment_method' => 'cash',
                        'transaction_type' => 'expense',
                        'source' => $purchase->supplier_name,
                        'amount' => $newPaid,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('purchases.index')
            ->with('success', 'Purchase updated successfully.');
    }


    public function destroy(Purchase $purchase)
    {
        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                $product = Product::find($item->product_id);
                $product->decrement('stock', $item->quantity);
            }

            $purchase->items()->delete();
            $purchase->delete();
        });

        return redirect()->route('purchases.index')->with('success', 'Purchase deleted successfully.');
    }
}
