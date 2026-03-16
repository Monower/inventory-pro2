<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderActivityLog;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderRefund;
use App\Models\OrderRefundExchangeItem;
use App\Models\OrderRefundItem;
use App\Models\StockLedger;
use App\Models\Staff;
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
        $paymentStatus = trim((string) request()->query('payment_status', ''));
        $refundStatus = trim((string) request()->query('refund_status', ''));
        $orderStatus = trim((string) request()->query('order_status', ''));
        $fulfillmentStatus = trim((string) request()->query('fulfillment_status', ''));
        $customerId = request()->query('customer_id');
        $salespersonId = request()->query('salesperson_staff_id');
        $dateFrom = request()->query('date_from');
        $dateTo = request()->query('date_to');
        $allowedViews = ['all', 'completed', 'refunded'];

        if (!in_array($view, $allowedViews, true)) {
            $view = 'all';
        }

        $orders = Order::with('customer', 'items.product', 'salesperson')
            ->when($view === 'completed', function ($query) {
                $query->where('order_status', 'completed');
            })
            ->when($view === 'refunded', function ($query) {
                $query->whereIn('refund_status', ['partial', 'full']);
            })
            ->when($paymentStatus !== '', fn ($query) => $query->where('payment_status', $paymentStatus))
            ->when($refundStatus !== '', fn ($query) => $query->where('refund_status', $refundStatus))
            ->when($orderStatus !== '', fn ($query) => $query->where('order_status', $orderStatus))
            ->when($fulfillmentStatus !== '', fn ($query) => $query->where('fulfillment_status', $fulfillmentStatus))
            ->when($customerId, fn ($query) => $query->where('customer_id', $customerId))
            ->when($salespersonId, fn ($query) => $query->where('salesperson_staff_id', $salespersonId))
            ->when($dateFrom, fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('order_number', 'like', "%{$q}%")
                        ->orWhere('invoice_number', 'like', "%{$q}%")
                        ->orWhere('total_amount', 'like', "%{$q}%")
                        ->orWhere('payment_status', 'like', "%{$q}%")
                        ->orWhere('refund_status', 'like', "%{$q}%")
                        ->orWhere('order_status', 'like', "%{$q}%")
                        ->orWhere('coupon_code', 'like', "%{$q}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($q) {
                            $customerQuery->where('name', 'like', "%{$q}%")
                                ->orWhere('phone', 'like', "%{$q}%");
                        })
                        ->orWhereHas('salesperson', function ($staffQuery) use ($q) {
                            $staffQuery->where('name', 'like', "%{$q}%")
                                ->orWhere('phone', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::query()->select('id', 'phone', 'name')->orderBy('phone')->get();
        $staffs = Staff::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'customers' => $customers,
            'staffs' => $staffs,
            'filters' => [
                'q' => $q,
                'view' => $view,
                'payment_status' => $paymentStatus,
                'refund_status' => $refundStatus,
                'order_status' => $orderStatus,
                'fulfillment_status' => $fulfillmentStatus,
                'customer_id' => $customerId,
                'salesperson_staff_id' => $salespersonId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create()
    {
        $customers = Customer::query()->select('id', 'phone')->orderBy('phone')->get();
        $staffs = Staff::query()->select('id', 'name', 'phone')->orderBy('name')->get();
        $products = Product::query()
            ->select('id', 'name', 'buying_price', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();
        return Inertia::render('orders/create', compact('customers', 'products', 'banks', 'staffs'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'salesperson_staff_id' => 'nullable|exists:staff,id',
            'branch_name' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:2000',
            'coupon_code' => 'nullable|string|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'shipping_charge' => 'nullable|numeric|min:0',
            'courier_name' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'fulfillment_status' => 'nullable|in:' . implode(',', Order::FULFILLMENT_STATUSES),
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
                $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . Str::upper(Str::random(5));

                $subTotalAmount = 0;

                foreach ($validated['cart'] as $item) {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $subTotalAmount += $product->selling_price * $item['quantity'];
                }

                $discountAmount = min((float) ($validated['discount_amount'] ?? 0), $subTotalAmount);
                $taxRate = (float) ($validated['tax_rate'] ?? 0);
                $taxableBase = max($subTotalAmount - $discountAmount, 0);
                $taxAmount = round($taxableBase * ($taxRate / 100), 2);
                $shippingCharge = (float) ($validated['shipping_charge'] ?? 0);
                $totalAmount = $taxableBase + $taxAmount + $shippingCharge;

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
                    'invoice_number' => $invoiceNumber,
                    'customer_id' => $validated['customer_id'],
                    'subtotal_amount' => $subTotalAmount,
                    'salesperson_staff_id' => $validated['salesperson_staff_id'] ?? null,
                    'branch_name' => $validated['branch_name'] ?? null,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'coupon_code' => $validated['coupon_code'] ?? null,
                    'discount_amount' => $discountAmount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'shipping_charge' => $shippingCharge,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'payment_status' => $paymentStatus,
                    'order_status' => 'confirmed',
                    'fulfillment_status' => $validated['fulfillment_status'] ?? 'pending',
                    'shipped_at' => ($validated['fulfillment_status'] ?? 'pending') === 'shipped' ||
                        ($validated['fulfillment_status'] ?? 'pending') === 'delivered'
                        ? now()
                        : null,
                    'delivered_at' => ($validated['fulfillment_status'] ?? 'pending') === 'delivered'
                        ? now()
                        : null,
                    'courier_name' => $validated['courier_name'] ?? null,
                    'tracking_number' => $validated['tracking_number'] ?? null,
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
                    $product->refresh();
                    $this->recordStockMovement(
                        $product,
                        'sale',
                        -1 * (int) $item['quantity'],
                        Order::class,
                        $order->id,
                        "Stock issued for order {$order->order_number}."
                    );
                }

                if ($paidAmount > 0) {
                    $this->createPaymentRecord($order, [
                        'paid_at' => now(),
                        'amount' => $paidAmount,
                        'payment_method' => $validated['payment_method'],
                        'bank_id' => $validated['payment_method'] === 'bank'
                            ? ($validated['bank_id'] ?? null)
                            : null,
                        'mfs' => $validated['payment_method'] === 'mobile'
                            ? ($validated['mfs'] ?? null)
                            : null,
                        'notes' => 'Initial payment captured during order creation.',
                    ]);
                }

                $this->logActivity(
                    $order,
                    'order_created',
                    'Order created',
                    "Order {$order->order_number} was created.",
                    [
                        'total_amount' => $order->total_amount,
                        'subtotal_amount' => $order->subtotal_amount,
                        'discount_amount' => $order->discount_amount,
                        'tax_amount' => $order->tax_amount,
                        'invoice_number' => $order->invoice_number,
                        'paid_amount' => $order->paid_amount,
                        'payment_status' => $order->payment_status,
                        'order_status' => $order->order_status,
                        'fulfillment_status' => $order->fulfillment_status,
                    ]
                );
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
        if ($order->refunds()->exists() || $order->payments()->exists()) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Orders with payment or refund history cannot be edited.');
        }

        $order->load('items.product');
        $customers = Customer::query()->select('id', 'phone')->orderBy('phone')->get();
        $staffs = Staff::query()->select('id', 'name', 'phone')->orderBy('name')->get();
        $products = Product::query()
            ->select('id', 'name', 'buying_price', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('orders/edit', compact('order', 'customers', 'products', 'banks', 'staffs'));
    }

    public function update(Request $request, Order $order)
    {
        if ($order->refunds()->exists() || $order->payments()->exists()) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Orders with payment or refund history cannot be updated.');
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.product_id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'salesperson_staff_id' => 'nullable|exists:staff,id',
            'branch_name' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:2000',
            'coupon_code' => 'nullable|string|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'shipping_charge' => 'nullable|numeric|min:0',
            'courier_name' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'fulfillment_status' => 'nullable|in:' . implode(',', Order::FULFILLMENT_STATUSES),

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
                $subTotalAmount = 0;
                $products = Product::whereIn(
                    'id',
                    collect($validated['cart'])->pluck('product_id')
                )->get()->keyBy('id');

                foreach ($validated['cart'] as $item) {
                    $product = $products[$item['product_id']];

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $subTotalAmount += $product->selling_price * $item['quantity'];
                }

                $discountAmount = min((float) ($validated['discount_amount'] ?? 0), $subTotalAmount);
                $taxRate = (float) ($validated['tax_rate'] ?? 0);
                $taxableBase = max($subTotalAmount - $discountAmount, 0);
                $taxAmount = round($taxableBase * ($taxRate / 100), 2);
                $shippingCharge = (float) ($validated['shipping_charge'] ?? 0);
                $totalAmount = $taxableBase + $taxAmount + $shippingCharge;

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
                    'subtotal_amount' => $subTotalAmount,
                    'salesperson_staff_id' => $validated['salesperson_staff_id'] ?? null,
                    'branch_name' => $validated['branch_name'] ?? null,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'coupon_code' => $validated['coupon_code'] ?? null,
                    'discount_amount' => $discountAmount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'shipping_charge' => $shippingCharge,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'payment_status' => $paymentStatus,
                    'fulfillment_status' => $validated['fulfillment_status'] ?? $order->fulfillment_status,
                    'shipped_at' => ($validated['fulfillment_status'] ?? $order->fulfillment_status) === 'shipped' ||
                        ($validated['fulfillment_status'] ?? $order->fulfillment_status) === 'delivered'
                        ? ($order->shipped_at ?? now())
                        : null,
                    'delivered_at' => ($validated['fulfillment_status'] ?? $order->fulfillment_status) === 'delivered'
                        ? now()
                        : null,
                    'courier_name' => $validated['courier_name'] ?? null,
                    'tracking_number' => $validated['tracking_number'] ?? null,
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
                    $product->refresh();
                    $this->recordStockMovement(
                        $product,
                        'sale_adjustment',
                        -1 * (int) $item['quantity'],
                        Order::class,
                        $order->id,
                        "Stock re-issued after updating order {$order->order_number}."
                    );
                }

                $this->logActivity(
                    $order,
                    'order_updated',
                    'Order updated',
                    "Order {$order->order_number} was updated.",
                    [
                        'total_amount' => $order->total_amount,
                        'subtotal_amount' => $order->subtotal_amount,
                        'discount_amount' => $order->discount_amount,
                        'tax_amount' => $order->tax_amount,
                        'paid_amount' => $order->paid_amount,
                        'payment_status' => $order->payment_status,
                        'payment_method' => $order->payment_method,
                        'branch_name' => $order->branch_name,
                        'fulfillment_status' => $order->fulfillment_status,
                    ]
                );
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
                    'salesperson',
                    'items.product',
                    'payments.bank',
                    'payments.receivedBy',
                    'refunds.items.product',
                    'refunds.exchangeItems.product',
                    'refunds.bank',
                    'refunds.processedBy',
                    'activityLogs.causer',
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
                $order->can_collect_payment =
                    $order->due_amount > 0 && $order->order_status !== 'cancelled';
                $order->status_options = Order::STATUSES;
                $order->fulfillment_status_options = Order::FULFILLMENT_STATUSES;
                $refundIds = $order->refunds->pluck('id');
                $stockLedger = StockLedger::query()
                    ->with('product')
                    ->where(function ($query) use ($order, $refundIds) {
                        $query->where(function ($orderQuery) use ($order) {
                            $orderQuery->where('source_type', Order::class)
                                ->where('source_id', $order->id);
                        });

                        if ($refundIds->isNotEmpty()) {
                            $query->orWhere(function ($refundQuery) use ($refundIds) {
                                $refundQuery->where('source_type', OrderRefund::class)
                                    ->whereIn('source_id', $refundIds);
                            });
                        }
                    })
                    ->latest()
                    ->get();

                return Inertia::render('orders/show', compact('order', 'stockLedger'));
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
        $products = Product::query()
            ->select('id', 'name', 'selling_price', 'stock')
            ->orderBy('name')
            ->get();

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
                'order_status' => $order->order_status,
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
            'products' => $products,
        ]);
    }

    public function storeRefund(Request $request, Order $order)
    {
        $validated = $request->validate([
            'refunded_at' => 'required|date',
            'resolution_type' => 'required|in:refund,return_only,exchange',
            'refund_method' => 'nullable|required_if:resolution_type,refund|in:original,cash,bank,mobile',
            'bank_id' => 'nullable|required_if:refund_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:refund_method,mobile|in:bkash,nagad,rocket',
            'reason' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.order_item_id' => 'required|exists:order_items,id',
            'items.*.quantity' => 'nullable|integer|min:0',
            'items.*.restock_to_inventory' => 'nullable|boolean',
            'exchange_items' => 'nullable|array',
            'exchange_items.*.product_id' => 'nullable|exists:products,id',
            'exchange_items.*.quantity' => 'nullable|integer|min:0',
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
        $exchangeItems = collect($validated['exchange_items'] ?? [])
            ->map(function ($item) {
                $item['product_id'] = $item['product_id'] ?? null;
                $item['quantity'] = (int) ($item['quantity'] ?? 0);

                return $item;
            })
            ->filter(fn ($item) => $item['product_id'] && $item['quantity'] > 0)
            ->values();

        if ($selectedItems->isEmpty()) {
            return back()->withErrors([
                'items' => 'Select at least one order item quantity to refund.',
            ]);
        }

        $returnValue = 0;

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

            $returnValue += $item['quantity'] * (float) $refundableItem['unit_price'];
        }

        if ($returnValue <= 0) {
            return back()->withErrors([
                'items' => 'Return total must be greater than zero.',
            ]);
        }

        $replacementCatalog = Product::query()
            ->whereIn('id', $exchangeItems->pluck('product_id'))
            ->get()
            ->keyBy('id');
        $replacementTotal = 0;

        foreach ($exchangeItems as $exchangeItem) {
            $product = $replacementCatalog->get($exchangeItem['product_id']);

            if (!$product) {
                return back()->withErrors([
                    'exchange_items' => 'One or more exchange products are invalid.',
                ]);
            }

            if ($product->stock < $exchangeItem['quantity']) {
                return back()->withErrors([
                    'exchange_items' => "Not enough stock available for exchange item {$product->name}.",
                ]);
            }

            $replacementTotal += $exchangeItem['quantity'] * (float) $product->selling_price;
        }

        if ($validated['resolution_type'] === 'refund' && $returnValue > (float) $order->refundable_amount) {
            return back()->withErrors([
                'items' => 'Refund total cannot exceed the paid amount still available for refund.',
            ]);
        }

        if ($validated['resolution_type'] === 'return_only' && $exchangeItems->isNotEmpty()) {
            return back()->withErrors([
                'exchange_items' => 'Return-only cases cannot contain replacement products.',
            ]);
        }

        if ($validated['resolution_type'] === 'exchange') {
            if ($exchangeItems->isEmpty()) {
                return back()->withErrors([
                    'exchange_items' => 'Select at least one replacement product for an exchange.',
                ]);
            }

            if ($replacementTotal > $returnValue) {
                return back()->withErrors([
                    'exchange_items' => 'Replacement product value cannot exceed the value of returned items in this exchange flow.',
                ]);
            }
        }

        $refundTotal = $validated['resolution_type'] === 'refund' ? $returnValue : 0;

        try {
            DB::transaction(function () use ($validated, $order, $selectedItems, $refundableItems, $refundTotal, $exchangeItems, $replacementCatalog, $replacementTotal) {
                $refund = OrderRefund::create([
                    'order_id' => $order->id,
                    'refund_number' => 'RFD-' . Str::upper(Str::random(8)),
                    'refunded_at' => $validated['refunded_at'],
                    'refund_method' => $validated['resolution_type'] === 'refund'
                        ? $validated['refund_method']
                        : 'n/a',
                    'resolution_type' => $validated['resolution_type'],
                    'bank_id' => ($validated['refund_method'] ?? null) === 'bank'
                        ? $validated['bank_id']
                        : null,
                    'mfs' => ($validated['refund_method'] ?? null) === 'mobile'
                        ? $validated['mfs']
                        : null,
                    'total_amount' => $refundTotal,
                    'replacement_total' => $replacementTotal,
                    'workflow_status' => 'processed',
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
                        $orderItem->product->refresh();
                        $this->recordStockMovement(
                            $orderItem->product,
                            'customer_return',
                            (int) $item['quantity'],
                            OrderRefund::class,
                            $refund->id,
                            "Customer return restocked for order {$order->order_number}."
                        );
                    }
                }

                foreach ($exchangeItems as $exchangeItem) {
                    $product = $replacementCatalog->get($exchangeItem['product_id']);
                    $lineTotal = $exchangeItem['quantity'] * (float) $product->selling_price;

                    OrderRefundExchangeItem::create([
                        'order_refund_id' => $refund->id,
                        'product_id' => $product->id,
                        'quantity' => $exchangeItem['quantity'],
                        'unit_price' => $product->selling_price,
                        'total_amount' => $lineTotal,
                    ]);

                    $product->decrement('stock', $exchangeItem['quantity']);
                    $product->refresh();
                    $this->recordStockMovement(
                        $product,
                        'exchange_issue',
                        -1 * (int) $exchangeItem['quantity'],
                        OrderRefund::class,
                        $refund->id,
                        "Replacement stock issued for exchange on order {$order->order_number}."
                    );
                }

                $this->syncRefundSummary($order->fresh()->load('items.refundItems'));

                $this->logActivity(
                    $order->fresh(),
                    'return_processed',
                    'Return processed',
                    "Return case {$refund->refund_number} was processed for order {$order->order_number}.",
                    [
                        'refund_number' => $refund->refund_number,
                        'resolution_type' => $refund->resolution_type,
                        'total_amount' => $refund->total_amount,
                        'replacement_total' => $refund->replacement_total,
                        'refund_method' => $refund->refund_method,
                    ]
                );
            });

            return redirect()
                ->route('orders.show', $order->id)
                ->with('success', 'Order return case processed successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function createPayment(Order $order)
    {
        if ((float) $order->due_amount <= 0) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'This order does not have any outstanding balance.');
        }

        if ($order->order_status === 'cancelled') {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Cancelled orders cannot receive additional payments.');
        }

        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('orders/payment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'order_status' => $order->order_status,
                'total_amount' => $order->total_amount,
                'paid_amount' => $order->paid_amount,
                'due_amount' => $order->due_amount,
                'customer' => [
                    'name' => $order->customer?->name,
                    'phone' => $order->customer?->phone,
                ],
            ],
            'banks' => $banks,
        ]);
    }

    public function storePayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'paid_at' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'notes' => 'nullable|string|max:2000',
        ]);

        if ((float) $order->due_amount <= 0) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'This order does not have any outstanding balance.');
        }

        if ($order->order_status === 'cancelled') {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Cancelled orders cannot receive additional payments.');
        }

        if ((float) $validated['amount'] > (float) $order->due_amount) {
            return back()->withErrors([
                'amount' => 'Collected amount cannot exceed the current due amount.',
            ]);
        }

        try {
            DB::transaction(function () use ($validated, $order) {
                $payment = $this->createPaymentRecord($order, $validated);
                $this->syncPaymentSummary($order->fresh());

                $this->logActivity(
                    $order->fresh(),
                    'payment_collected',
                    'Payment collected',
                    "Payment {$payment->payment_number} was collected for order {$order->order_number}.",
                    [
                        'payment_number' => $payment->payment_number,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                    ]
                );
            });

            return redirect()
                ->route('orders.show', $order->id)
                ->with('success', 'Order payment collected successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'required|in:' . implode(',', Order::STATUSES),
        ]);

        $newStatus = $validated['order_status'];
        $currentStatus = $order->order_status;

        if ($newStatus === $currentStatus) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('success', 'Order status is already up to date.');
        }

        $transitionError = $this->validateStatusTransition($order, $newStatus);

        if ($transitionError) {
            return back()->with('error', $transitionError);
        }

        $order->update([
            'order_status' => $newStatus,
        ]);

        $this->logActivity(
            $order,
            'status_changed',
            'Order status updated',
            "Order {$order->order_number} status changed from {$currentStatus} to {$newStatus}.",
            [
                'from' => $currentStatus,
                'to' => $newStatus,
            ]
        );

        return redirect()
            ->route('orders.show', $order->id)
            ->with('success', 'Order status updated successfully.');
    }

    public function updateFulfillment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'fulfillment_status' => 'required|in:' . implode(',', Order::FULFILLMENT_STATUSES),
            'courier_name' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $newStatus = $validated['fulfillment_status'];
        $oldStatus = $order->fulfillment_status;

        $payload = [
            'fulfillment_status' => $newStatus,
            'courier_name' => $validated['courier_name'] ?? null,
            'tracking_number' => $validated['tracking_number'] ?? null,
        ];

        if ($newStatus === 'shipped' && !$order->shipped_at) {
            $payload['shipped_at'] = now();
        }

        if ($newStatus === 'delivered') {
            $payload['shipped_at'] = $order->shipped_at ?? now();
            $payload['delivered_at'] = now();
        }

        $order->update($payload);

        $this->logActivity(
            $order,
            'fulfillment_updated',
            'Fulfillment updated',
            "Order {$order->order_number} fulfillment changed from {$oldStatus} to {$newStatus}.",
            [
                'from' => $oldStatus,
                'to' => $newStatus,
                'courier_name' => $order->courier_name,
                'tracking_number' => $order->tracking_number,
            ]
        );

        return redirect()
            ->route('orders.show', $order->id)
            ->with('success', 'Fulfillment updated successfully.');
    }

    public function invoice(Order $order)
    {
        $order->load([
            'customer',
            'salesperson',
            'items.product',
            'payments.bank',
            'refunds.items.product',
        ]);

        return Inertia::render('orders/invoice', [
            'order' => $order,
        ]);
    }


    public function destroy($id)
    {
        if ($id) {
            $order = Order::findOrFail($id);

            if ($order) {
                if ($order->refunds()->exists() || $order->payments()->exists()) {
                    return redirect()
                        ->route('orders.show', $order->id)
                        ->with('error', 'Orders with payment or refund history cannot be deleted.');
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

    private function createPaymentRecord(Order $order, array $paymentData): OrderPayment
    {
        return OrderPayment::create([
            'order_id' => $order->id,
            'payment_number' => 'PAY-' . Str::upper(Str::random(8)),
            'paid_at' => $paymentData['paid_at'],
            'amount' => $paymentData['amount'],
            'payment_method' => $paymentData['payment_method'],
            'bank_id' => $paymentData['payment_method'] === 'bank'
                ? ($paymentData['bank_id'] ?? null)
                : null,
            'mfs' => $paymentData['payment_method'] === 'mobile'
                ? ($paymentData['mfs'] ?? null)
                : null,
            'notes' => $paymentData['notes'] ?? null,
            'received_by' => auth()->id(),
        ]);
    }

    private function syncPaymentSummary(Order $order): void
    {
        $paidAmount = (float) $order->payments()->sum('amount');
        $dueAmount = max((float) $order->total_amount - $paidAmount, 0);

        $paymentStatus = $paidAmount <= 0
            ? 'pending'
            : ($dueAmount > 0 ? 'partial' : 'paid');

        $order->update([
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'payment_status' => $paymentStatus,
        ]);
    }

    private function validateStatusTransition(Order $order, string $newStatus): ?string
    {
        if ($newStatus === 'cancelled' && ((float) $order->paid_amount > 0 || $order->refunds()->exists())) {
            return 'Orders with payments or refunds cannot be cancelled directly.';
        }

        if ($order->order_status === 'cancelled') {
            return 'Cancelled orders cannot be moved to another status.';
        }

        if ($order->order_status === 'completed' && $newStatus !== 'completed') {
            return 'Completed orders cannot be moved back to another status.';
        }

        if ($newStatus === 'completed' && (float) $order->due_amount > 0) {
            return 'Collect the full payment before marking the order as completed.';
        }

        return null;
    }

    private function logActivity(
        Order $order,
        string $eventType,
        string $title,
        ?string $description = null,
        ?array $meta = null
    ): void {
        OrderActivityLog::create([
            'order_id' => $order->id,
            'event_type' => $eventType,
            'title' => $title,
            'description' => $description,
            'meta' => $meta,
            'causer_id' => auth()->id(),
        ]);
    }

    private function recordStockMovement(
        Product $product,
        string $movementType,
        int $quantityChange,
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?string $notes = null
    ): void {
        StockLedger::create([
            'product_id' => $product->id,
            'movement_type' => $movementType,
            'quantity_change' => $quantityChange,
            'balance_after' => (int) $product->stock,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'notes' => $notes,
            'causer_id' => auth()->id(),
        ]);
    }
}
