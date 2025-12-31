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
        $purchase_items = PurchaseItem::with(['purchase', 'product'])->latest()->get();

        return Inertia::render('Purchase/Index', [
            'purchase_items' => $purchase_items
        ]);
    }

    public function create()
    {
        $products = Product::select('id', 'name', 'buying_price', 'stock')->get();
        return Inertia::render('Purchase/Create', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        // dd($request->all());

        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|string',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $invoice = 'INV-' . time();

            $purchase = Purchase::create([
                'invoice_no' => $invoice,
                'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                'purchase_date' => $validated['purchase_date'],
                'payment_status' => $validated['payment_status'],
                'total_amount' => 0,
                'paid_amount' => $validated['paid_amount'] ?? 0, // fallback to 0
            ]);

            $totalAmount = 0;

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
                'source' => $purchase->supplier_name,
                'amount' => $purchase->paid_amount, // safe now
            ]);
        });


        return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load('items.product');
        $products = Product::select('id', 'name', 'buying_price')->get();
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
            'payment_status' => 'required|string',
            'paid_amount' => 'required|numeric|min:0', // this is the new payment entered
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $purchase) {
            $totalAmount = 0;

            // Revert previous stock
            foreach ($purchase->items as $oldItem) {
                $product = Product::find($oldItem->product_id);
                $product->decrement('stock', $oldItem->quantity);
            }

            $purchase->items()->delete();

            // Add updated items
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

            // Calculate new cumulative paid amount
            $newPaid = $validated['paid_amount']; // new payment this edit
            $cumulativePaid = $purchase->paid_amount + $newPaid;

            $paymentStatus = $cumulativePaid >= $totalAmount ? 'paid' : 'partial';

            // Update purchase
            $purchase->update([
                'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
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
                    'source' => $purchase->supplier_name,
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
