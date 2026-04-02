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
use App\Models\Setting;
use App\Support\CurrentTenant;

class OrderController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $orders = Order::with('customer', 'items.product')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('order_number', 'like', "%{$q}%")
                        ->orWhere('invoice_number', 'like', "%{$q}%")
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
            $order = null;

            DB::transaction(function () use ($validated, &$order) {
                $orderNumber = 'ORD-' . Str::upper(Str::random(6));

                $totalAmount = 0;

                foreach ($validated['cart'] as $item) {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $totalAmount += $product->selling_price * $item['quantity'];
                }

                if ($validated['payment_amount'] > $totalAmount) {
                    throw new \Exception('Payment amount cannot exceed total amount.');
                }

                $paidAmount = $validated['payment_amount'];
                $dueAmount = max($totalAmount - $paidAmount, 0);
                $paymentStatus = $paidAmount == 0
                    ? 'pending'
                    : ($dueAmount > 0 ? 'partial' : 'paid');

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'invoice_number' => $this->generateInvoiceNumber(),
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
                ->route('orders.show', $order->id)
                ->with('open_order_actions_modal', true)
                ->with('success', 'Order created successfully.');
        } catch (\Throwable $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function edit(Order $order)
    {
        $order->load('items.product', 'bank');
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
                    $oldItem->product->increment('stock', $oldItem->quantity);
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
                $order->load('customer', 'items.product', 'bank');
                return Inertia::render('orders/show', [
                    'order' => $order,
                    'can_print_sales_documents' => $this->canPrintSalesDocuments(),
                    'open_order_actions_modal' => (bool) request()->session()->get('open_order_actions_modal', false),
                ]);
            } else {
                return redirect()->route('orders.index')->with('error', 'Order not found.');
            }
        } else {
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        }
    }

    public function invoice(Order $order)
    {
        return $this->renderPrintableDocument($order, 'invoice');
    }

    public function receipt(Order $order)
    {
        return $this->renderPrintableDocument($order, 'receipt');
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

    protected function renderPrintableDocument(Order $order, string $documentType)
    {
        if (!$this->canPrintSalesDocuments()) {
            return redirect()
                ->route('orders.show', $order->id)
                ->with('error', 'Printable invoices and receipts are available on the Growth plan and above.');
        }

        $order->load('customer', 'items.product', 'bank');

        return Inertia::render('orders/print', [
            'order' => $order,
            'documentType' => $documentType,
            'receiptSettings' => $this->receiptSettings(),
        ]);
    }

    protected function receiptSettings(): array
    {
        $tenantId = app(CurrentTenant::class)->id();

        $settings = Setting::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('name', [
                'company_name',
                'company_address',
                'company_phone',
                'receipt_footer',
            ])
            ->pluck('value', 'name');

        return [
            'company_name' => $settings->get('company_name', config('app.name')),
            'company_address' => $settings->get('company_address', ''),
            'company_phone' => $settings->get('company_phone', ''),
            'receipt_footer' => $settings->get('receipt_footer', 'Thank you for shopping with us.'),
        ];
    }

    protected function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
        } while (Order::where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }

    protected function canPrintSalesDocuments(): bool
    {
        $user = request()->user();

        if ($user && $user->isSuperAdmin()) {
            return true;
        }

        $tenant = app(CurrentTenant::class)->get();
        $planSlug = strtolower((string) $tenant?->currentSubscription?->plan?->slug);

        return in_array($planSlug, ['growth', 'scale'], true);
    }
}
