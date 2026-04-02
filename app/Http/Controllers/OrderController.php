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
        $q = trim((string) request()->query('q', ''));

        $orders = Order::with('customer', 'items.product')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('order_number', 'like', "%{$q}%")
                        ->orWhere('total_amount', 'like', "%{$q}%")
                        ->orWhere('payment_status', 'like', "%{$q}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($q) {
                            $customerQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $q,
            ],
        ]);
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
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'payment_amount' => 'required|numeric|min:0',
        ], [
            'customer_id.required' => 'Customer is required',
            'cart.*.id.required' => 'Product ID is required',
            'cart.*.quantity.required' => 'Quantity is required',
            'cart.*.quantity.integer' => 'Quantity must be an integer',
            'cart.*.quantity.min' => 'Quantity must be at least 1',
            'payment_amount.required' => 'Payment amount is required',
            'payment_amount.numeric' => 'Payment amount must be a number',
            'payment_amount.min' => 'Payment amount must be at least 0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $orderNumber = 'ORD-' . Str::upper(Str::random(6));

                $totalAmount = 0;

                foreach ($validated['cart'] as $item) {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $totalAmount += $product->selling_price * $item['quantity'];
                }

                $paidAmount = $validated['payment_amount'];
                $dueAmount = max($totalAmount - $paidAmount, 0);
                $paymentStatus = $paidAmount == 0
                    ? 'pending'
                    : ($dueAmount > 0 ? 'partial' : 'paid');

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $validated['customer_id'],
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'payment_status' => $paymentStatus,
                ]);

                foreach ($validated['cart'] as $item) {
                    $product = Product::findOrFail($item['id']);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->selling_price,
                    ]);

                    $product->decrementVariantlessStock((int) $item['quantity']);
                }
            });

            return redirect()
                ->route('orders.index')
                ->with('success', 'Order created successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
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

        try {
            DB::transaction(function () use ($request, $order) {

                /* ----------------------------
               Restore previous stock
            ----------------------------- */
                foreach ($order->items as $oldItem) {
                    $oldItem->product->incrementVariantlessStock((int) $oldItem->quantity);
                }
                $order->items()->delete();

                /* ----------------------------
               Calculate total
            ----------------------------- */
                $totalAmount = 0;
                $products = Product::whereIn(
                    'id',
                    collect($request->cart)->pluck('product_id')
                )->get()->keyBy('id');

                foreach ($request->cart as $item) {
                    $product = $products[$item['product_id']];

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $totalAmount += $product->selling_price * $item['quantity'];
                }

                /* ----------------------------
               Prevent overpayment
            ----------------------------- */
                if ($request->payment_amount > $totalAmount) {
                    throw new \Exception("Payment amount cannot exceed total amount.");
                }

                $paidAmount = $request->payment_amount;
                $dueAmount = $totalAmount - $paidAmount;

                $paymentStatus = $paidAmount == 0
                    ? 'pending'
                    : ($dueAmount > 0 ? 'partial' : 'paid');

                /* ----------------------------
               Update order
            ----------------------------- */
                $order->update([
                    'customer_id' => $request->customer_id,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'payment_status' => $paymentStatus,
                    'payment_method' => $request->payment_method,
                    'bank_id' => $request->payment_method === 'bank'
                        ? $request->bank_id
                        : null,
                    'mfs' => $request->payment_method === 'mobile'
                        ? $request->mfs
                        : null,
                ]);

                /* ----------------------------
               Create new items & deduct stock
            ----------------------------- */
                foreach ($request->cart as $item) {
                    $product = $products[$item['product_id']];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->selling_price,
                    ]);

                    $product->decrementVariantlessStock((int) $item['quantity']);
                }
            });

            return redirect()
                ->route('orders.index')
                ->with('success', 'Order updated successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }



    /**
     * Display a single order.
     */
    public function show($id)
    {
        if ($id) {
            $order = Order::findOrFail($id);

            if ($order) {
                $order->load('customer', 'items.product');
                return Inertia::render('orders/show', compact('order'));
            } else {
                return redirect()->route('orders.index')->with('error', 'Order not found.');
            }
        } else {
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        }
    }


    public function destroy($id)
    {
        if ($id) {
            $order = Order::findOrFail($id);

            if ($order) {
                foreach ($order->items as $item) {
                    $item->product->increment('stock', $item->quantity);
                }
                $order->items()->delete();
                $order->delete();

                return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
            } else {
                return redirect()->route('orders.index')->with('error', 'Order not found.');
            }
        } else {
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        }
    }
}
