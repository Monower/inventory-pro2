<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with('items.product')->latest()->get();
        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|string',
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

                // Update product stock and buying price
                $product = Product::find($item['product_id']);
                $product->increment('stock', $item['quantity']);
                $product->update(['buying_price' => $item['buying_price']]);
            }

            $purchase->update(['total_amount' => $totalAmount]);

            // Log transaction (expense)
            Transaction::create([
                'name' => 'Product Purchase - ' . $purchase->invoice_no,
                'payment_method' => 'cash',
                'transaction_type' => 'expense',
                'source' => $purchase->supplier_name,
                'amount' => $totalAmount,
            ]);
        });

        return response()->json(['message' => 'Purchase recorded successfully.'], 201);
    }
}
