<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Bank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('customer', 'items.product')->latest()->get();
        return Inertia::render('orders/index', compact('orders'));
    }

    public function create()
    {
        $customers = Customer::all();
        $products = Product::all();
        $banks = Bank::all();
        return Inertia::render('orders/create', compact('customers', 'products', 'banks'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'payment_amount' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $orderNumber = 'ORD-' . Str::upper(Str::random(6));

            $totalAmount = 0;
            foreach ($request->cart as $item) {
                $product = Product::findOrFail($item['id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Not enough stock for {$product->name}");
                }
                $totalAmount += $product->selling_price * $item['quantity'];
            }

            $paidAmount = $request->payment_amount;
            $dueAmount = max($totalAmount - $paidAmount, 0);
            $paymentStatus = $paidAmount == 0 ? 'pending' : ($dueAmount > 0 ? 'partial' : 'paid');

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $request->customer_id,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
            ]);

            foreach ($request->cart as $item) {
                $product = Product::findOrFail($item['id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->selling_price,
                ]);
                $product->decrement('stock', $item['quantity']);
            }
        });

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }

    public function edit(Order $order)
    {
        $order->load('items.product');
        $customers = Customer::all();
        $products = Product::all();
        $banks = Bank::all();

        return Inertia::render('orders/edit', compact('order', 'customers', 'products', 'banks'));
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.product_id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'payment_amount' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $order) {
            // Restore previous stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $totalAmount = 0;
            foreach ($request->cart as $item) {
                $product = Product::findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Not enough stock for {$product->name}");
                }
                $totalAmount += $product->selling_price * $item['quantity'];
            }

            $paidAmount = $request->payment_amount;
            $dueAmount = max($totalAmount - $paidAmount, 0);
            $paymentStatus = $paidAmount == 0 ? 'pending' : ($dueAmount > 0 ? 'partial' : 'paid');

            // Update order
            $order->update([
                'customer_id' => $request->customer_id,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
            ]);

            // Remove previous items and add new ones
            $order->items()->delete();
            foreach ($request->cart as $item) {
                $product = Product::findOrFail($item['product_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->selling_price,
                ]);
                $product->decrement('stock', $item['quantity']);
            }
        });

        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    /**
     * Display a single order.
     */
    public function show(Order $order)
    {
        // Load related customer and order items with product details
        $order->load('customer', 'items.product');

        // Pass to Inertia view
        return Inertia::render('orders/show', compact('order'));
    }


    public function destroy(Order $order)
    {
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }
        $order->items()->delete();
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
