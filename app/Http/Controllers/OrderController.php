<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderRefund;
use App\Models\OrderRefundItem;
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
        $view = request()->query('view', 'all');
        $allowedViews = ['all', 'completed', 'refunded'];

        if (!in_array($view, $allowedViews, true)) {
            $view = 'all';
        }

        $orders = Order::with('customer', 'items.product')
            ->when($view === 'completed', function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('refund_status', 'none');
            })
            ->when($view === 'refunded', function ($query) {
                $query->whereIn('refund_status', ['partial', 'full']);
            })
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('order_number', 'like', "%{$q}%")
                        ->orWhere('total_amount', 'like', "%{$q}%")
                        ->orWhere('payment_status', 'like', "%{$q}%")
                        ->orWhere('refund_status', 'like', "%{$q}%")
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
                'view' => $view,
            ],
        ]);
    }

    public function create()
    {
        $customers = Customer::query()->select('id', 'phone')->orderBy('phone')->get();
        $products = Product::query()
            ->select('id', 'name', 'buying_price', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();
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
                if ($paidAmount > $totalAmount) {
                    throw new \Exception('Payment amount cannot exceed total amount.');
                }
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
                    'payment_method' => $validated['payment_method'],
                    'bank_id' => $validated['payment_method'] === 'bank'
                        ? $validated['bank_id']
                        : null,
                    'mfs' => $validated['payment_method'] === 'mobile'
                        ? $validated['mfs']
                        : null,
                ]);

                foreach ($validated['cart'] as $item) {
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
        if ($order->refunds()->exists()) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Refunded orders cannot be edited.');
        }

        $order->load('items.product');
        $customers = Customer::query()->select('id', 'phone')->orderBy('phone')->get();
        $products = Product::query()
            ->select('id', 'name', 'buying_price', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('orders/edit', compact('order', 'customers', 'products', 'banks'));
    }

    public function update(Request $request, Order $order)
    {
        if ($order->refunds()->exists()) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Refunded orders cannot be updated.');
        }

        $validated = $request->validate([
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
            DB::transaction(function () use ($validated, $order) {

                /* ----------------------------
               Restore previous stock
            ----------------------------- */
                foreach ($order->items as $oldItem) {
                    $oldItem->product->increment('stock', $oldItem->quantity);
                }
                $order->items()->delete();

                /* ----------------------------
               Calculate total
            ----------------------------- */
                $totalAmount = 0;
                $products = Product::whereIn(
                    'id',
                    collect($validated['cart'])->pluck('product_id')
                )->get()->keyBy('id');

                foreach ($validated['cart'] as $item) {
                    $product = $products[$item['product_id']];

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $totalAmount += $product->selling_price * $item['quantity'];
                }

                /* ----------------------------
               Prevent overpayment
            ----------------------------- */
                if ($validated['payment_amount'] > $totalAmount) {
                    throw new \Exception("Payment amount cannot exceed total amount.");
                }

                $paidAmount = $validated['payment_amount'];
                $dueAmount = $totalAmount - $paidAmount;

                $paymentStatus = $paidAmount == 0
                    ? 'pending'
                    : ($dueAmount > 0 ? 'partial' : 'paid');

                /* ----------------------------
               Update order
            ----------------------------- */
                $order->update([
                    'customer_id' => $validated['customer_id'],
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'payment_status' => $paymentStatus,
                    'payment_method' => $validated['payment_method'],
                    'bank_id' => $validated['payment_method'] === 'bank'
                        ? $validated['bank_id']
                        : null,
                    'mfs' => $validated['payment_method'] === 'mobile'
                        ? $validated['mfs']
                        : null,
                ]);

                /* ----------------------------
               Create new items & deduct stock
            ----------------------------- */
                foreach ($validated['cart'] as $item) {
                    $product = $products[$item['product_id']];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->selling_price,
                    ]);

                    $product->decrement('stock', $item['quantity']);
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
                $order->load([
                    'customer',
                    'items.product',
                    'refunds.items.product',
                    'refunds.bank',
                ]);

                $refundedQuantities = $order->refunds
                    ->flatMap->items
                    ->groupBy('order_item_id')
                    ->map(fn ($items) => (int) $items->sum('quantity'));

                $order->items->each(function ($item) use ($refundedQuantities) {
                    $refundedQuantity = (int) ($refundedQuantities[$item->id] ?? 0);
                    $item->refunded_quantity = $refundedQuantity;
                    $item->refundable_quantity = max($item->quantity - $refundedQuantity, 0);
                });

                $order->can_refund = $order->items->contains(
                    fn ($item) => $item->refundable_quantity > 0
                ) && $order->refundable_amount > 0;

                return Inertia::render('orders/show', compact('order'));
            } else {
                return redirect()->route('orders.index')->with('error', 'Order not found.');
            }
        } else {
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        }
    }

    public function createRefund(Order $order)
    {
        $order->load('customer', 'items.product');

        $refundItems = $this->buildRefundableItems($order);
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();

        if (collect($refundItems)->every(fn ($item) => $item['max_quantity'] === 0)) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'This order has no refundable quantities remaining.');
        }

        if ((float) $order->refundable_amount <= 0) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'This order has no refundable payment remaining.');
        }

        return Inertia::render('orders/refund', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'refund_status' => $order->refund_status,
                'total_amount' => $order->total_amount,
                'paid_amount' => $order->paid_amount,
                'refunded_amount' => $order->refunded_amount,
                'refundable_amount' => $order->refundable_amount,
                'customer' => [
                    'name' => $order->customer?->name,
                    'phone' => $order->customer?->phone,
                ],
            ],
            'items' => $refundItems,
            'banks' => $banks,
        ]);
    }

    public function storeRefund(Request $request, Order $order)
    {
        $validated = $request->validate([
            'refunded_at' => 'required|date',
            'refund_method' => 'required|in:original,cash,bank,mobile',
            'bank_id' => 'nullable|required_if:refund_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:refund_method,mobile|in:bkash,nagad,rocket',
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.order_item_id' => 'required|exists:order_items,id',
            'items.*.quantity' => 'nullable|integer|min:0',
            'items.*.restock_to_inventory' => 'nullable|boolean',
        ]);

        $order->load('items.product');
        $refundableItems = collect($this->buildRefundableItems($order))->keyBy('order_item_id');
        $selectedItems = collect($validated['items'])
            ->map(function ($item) {
                $item['quantity'] = (int) ($item['quantity'] ?? 0);
                $item['restock_to_inventory'] = (bool) ($item['restock_to_inventory'] ?? false);

                return $item;
            })
            ->filter(fn ($item) => $item['quantity'] > 0)
            ->values();

        if ($selectedItems->isEmpty()) {
            return back()->withErrors([
                'items' => 'Select at least one order item quantity to refund.',
            ]);
        }

        $refundTotal = 0;

        foreach ($selectedItems as $item) {
            $refundableItem = $refundableItems->get($item['order_item_id']);

            if (!$refundableItem) {
                return back()->withErrors([
                    'items' => 'One or more refund lines are invalid for this order.',
                ]);
            }

            if ($item['quantity'] > $refundableItem['max_quantity']) {
                return back()->withErrors([
                    'items' => "Refund quantity for {$refundableItem['product_name']} exceeds the remaining refundable quantity.",
                ]);
            }

            $refundTotal += $item['quantity'] * (float) $refundableItem['unit_price'];
        }

        if ($refundTotal <= 0) {
            return back()->withErrors([
                'items' => 'Refund total must be greater than zero.',
            ]);
        }

        if ($refundTotal > (float) $order->refundable_amount) {
            return back()->withErrors([
                'items' => 'Refund total cannot exceed the paid amount still available for refund.',
            ]);
        }

        try {
            DB::transaction(function () use ($validated, $order, $selectedItems, $refundableItems, $refundTotal) {
                $refund = OrderRefund::create([
                    'order_id' => $order->id,
                    'refund_number' => 'RFD-' . Str::upper(Str::random(8)),
                    'refunded_at' => $validated['refunded_at'],
                    'refund_method' => $validated['refund_method'],
                    'bank_id' => $validated['refund_method'] === 'bank'
                        ? $validated['bank_id']
                        : null,
                    'mfs' => $validated['refund_method'] === 'mobile'
                        ? $validated['mfs']
                        : null,
                    'total_amount' => $refundTotal,
                    'reason' => $validated['reason'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'processed_by' => auth()->id(),
                ]);

                foreach ($selectedItems as $item) {
                    $refundableItem = $refundableItems->get($item['order_item_id']);
                    $orderItem = $order->items->firstWhere('id', $item['order_item_id']);

                    OrderRefundItem::create([
                        'order_refund_id' => $refund->id,
                        'order_item_id' => $orderItem->id,
                        'product_id' => $orderItem->product_id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $refundableItem['unit_price'],
                        'total_amount' => $item['quantity'] * (float) $refundableItem['unit_price'],
                        'restock_to_inventory' => $item['restock_to_inventory'],
                    ]);

                    if ($item['restock_to_inventory']) {
                        $orderItem->product->increment('stock', $item['quantity']);
                    }
                }

                $this->syncRefundSummary($order->fresh()->load('items.refundItems'));
            });

            return redirect()
                ->route('orders.show', $order->id)
                ->with('success', 'Order refund recorded successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }


    public function destroy($id)
    {
        if ($id) {
            $order = Order::findOrFail($id);

            if ($order) {
                if ($order->refunds()->exists()) {
                    return redirect()
                        ->route('orders.show', $order->id)
                        ->with('error', 'Refunded orders cannot be deleted.');
                }

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

    private function buildRefundableItems(Order $order): array
    {
        $refundedQuantities = OrderRefundItem::query()
            ->whereIn('order_item_id', $order->items->pluck('id'))
            ->selectRaw('order_item_id, SUM(quantity) as refunded_quantity')
            ->groupBy('order_item_id')
            ->pluck('refunded_quantity', 'order_item_id');

        return $order->items->map(function ($item) use ($refundedQuantities) {
            $refundedQuantity = (int) ($refundedQuantities[$item->id] ?? 0);
            $maxQuantity = max($item->quantity - $refundedQuantity, 0);

            return [
                'order_item_id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'sold_quantity' => $item->quantity,
                'refunded_quantity' => $refundedQuantity,
                'max_quantity' => $maxQuantity,
                'unit_price' => (float) $item->price,
                'line_total' => (float) $item->price * $item->quantity,
            ];
        })->all();
    }

    private function syncRefundSummary(Order $order): void
    {
        $order->loadMissing('items.refundItems');

        $refundedAmount = (float) OrderRefund::query()
            ->where('order_id', $order->id)
            ->sum('total_amount');

        $hasRefunds = false;
        $isFullyRefunded = $order->items->every(function ($item) use (&$hasRefunds) {
            $refundedQuantity = (int) $item->refundItems->sum('quantity');

            if ($refundedQuantity > 0) {
                $hasRefunds = true;
            }

            return $refundedQuantity >= $item->quantity;
        });

        $order->update([
            'refunded_amount' => $refundedAmount,
            'refund_status' => !$hasRefunds
                ? 'none'
                : ($isFullyRefunded ? 'full' : 'partial'),
        ]);
    }
}
