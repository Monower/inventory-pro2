<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchProductInventory;
use App\Models\Bank;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $activeBranchId = $this->activeBranchId();
        $q = trim((string) request()->query('q', ''));

        $purchases = Purchase::query()
            ->with(['branch', 'supplier'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('invoice_no', 'like', "%{$q}%")
                        ->orWhere('supplier_name', 'like', "%{$q}%")
                        ->orWhere('payment_status', 'like', "%{$q}%")
                        ->orWhereHas('supplier', fn ($supplierQuery) => $supplierQuery->where('name', 'like', "%{$q}%"));
                });
            })
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchase/Index', [
            'purchases' => $purchases,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        $activeBranchId = $this->activeBranchId();
        $products = Product::query()
            ->with(['branchInventories' => fn ($query) => $query->select('id', 'branch_id', 'product_id', 'stock')])
            ->select('id', 'name', 'buying_price', 'stock')
            ->orderBy('name')
            ->get();
        $branches = $this->accessibleBranchesQuery()->get(['id', 'name', 'code']);
        $suppliers = Supplier::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'phone']);
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();
        return Inertia::render('Purchase/Create', [
            'products' => $products,
            'branches' => $branches,
            'activeBranchId' => $activeBranchId,
            'suppliers' => $suppliers,
            'banks' => $banks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        $this->ensureBranchAccessible((int) $validated['branch_id']);

        try {
            DB::transaction(function () use ($validated) {
                $invoice = 'INV-' . time();
                $supplier = Supplier::findOrFail($validated['supplier_id']);

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

                $branch = Branch::findOrFail($validated['branch_id']);

                $purchase = Purchase::create([
                    'invoice_no' => $invoice,
                    'supplier_id' => $supplier->id,
                    'supplier_name' => $supplier->name,
                    'branch_id' => $branch->id,
                    'purchase_date' => $validated['purchase_date'],
                    'payment_status' => $paymentStatus,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => max($totalAmount - $paidAmount, 0),
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
                    $inventory = $this->adjustBranchInventory($branch->id, $product, (int) $item['quantity']);
                    $product->update(['buying_price' => $item['buying_price']]);
                    $this->recordStockMovement(
                        $product,
                        $branch,
                        'purchase_receipt',
                        (int) $item['quantity'],
                        Purchase::class,
                        $purchase->id,
                        "Stock received into {$branch->name} from purchase {$purchase->invoice_no}.",
                        $inventory->stock
                    );
                }

                if ($paidAmount > 0) {
                    $payment = $this->createSupplierPaymentRecord($purchase, $supplier, $validated, $paidAmount);

                    Transaction::create([
                        'name' => 'Product Purchase - ' . $purchase->invoice_no,
                        'payment_method' => $payment->payment_method,
                        'transaction_type' => 'expense',
                        'source' => $supplier->name,
                        'amount' => $paidAmount,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }


        return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');
    }

    public function show(Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);

        $purchase->load([
            'supplier',
            'branch',
            'items.product',
            'payments.bank',
            'payments.receivedBy',
        ]);

        $purchase->payments->each(function ($payment) {
            $payment->received_by_name = $payment->receivedBy?->name;
            $payment->payment_channel_label = $payment->bank?->name ?: $payment->mfs;
        });

        $purchase->can_collect_payment = (float) $purchase->due_amount > 0;

        return Inertia::render('Purchase/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function edit(Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);
        $purchase->load('items.product', 'supplier', 'payments.bank');
        $products = Product::query()
            ->with(['branchInventories' => fn ($query) => $query->select('id', 'branch_id', 'product_id', 'stock')])
            ->select('id', 'name', 'buying_price', 'stock')
            ->orderBy('name')
            ->get();
        $branches = $this->accessibleBranchesQuery()->get(['id', 'name', 'code']);
        $suppliers = Supplier::query()->where('is_active', true)->orWhere('id', $purchase->supplier_id)->orderBy('name')->get(['id', 'name', 'phone']);
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();
        return Inertia::render('Purchase/Edit', [
            'purchase' => $purchase,
            'products' => $products,
            'branches' => $branches,
            'suppliers' => $suppliers,
            'banks' => $banks,
        ]);
    }

    public function update(Request $request, Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|required_with:paid_amount|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        $this->ensureBranchAccessible((int) $validated['branch_id']);

        try {
            DB::transaction(function () use ($validated, $purchase) {
                $totalAmount = 0;
                $supplier = Supplier::findOrFail($validated['supplier_id']);

                // Revert previous stock
                foreach ($purchase->items as $oldItem) {
                    $product = Product::find($oldItem->product_id);
                    $this->adjustBranchInventory($purchase->branch_id, $product, -1 * (int) $oldItem->quantity);
                }

                $purchase->items()->delete();

                $branch = Branch::findOrFail($validated['branch_id']);

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
                    $inventory = $this->adjustBranchInventory($branch->id, $product, (int) $item['quantity']);
                    $product->update(['buying_price' => $item['buying_price']]);
                    $this->recordStockMovement(
                        $product,
                        $branch,
                        'purchase_adjustment',
                        (int) $item['quantity'],
                        Purchase::class,
                        $purchase->id,
                        "Stock adjusted into {$branch->name} after updating purchase {$purchase->invoice_no}.",
                        $inventory->stock
                    );
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
                    'supplier_id' => $supplier->id,
                    'supplier_name' => $supplier->name,
                    'branch_id' => $branch->id,
                    'purchase_date' => $validated['purchase_date'],
                    'payment_status' => $paymentStatus,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $cumulativePaid,
                    'due_amount' => max($totalAmount - $cumulativePaid, 0),
                ]);

                // Keep historical supplier payment records aligned with the edited purchase.
                $purchase->payments()->update([
                    'supplier_id' => $supplier->id,
                    'branch_id' => $branch->id,
                ]);

                if ($newPaid > 0) {
                    $payment = $this->createSupplierPaymentRecord($purchase, $supplier, $validated, $newPaid);

                    Transaction::create([
                        'name' => 'Product Purchase - ' . $purchase->invoice_no,
                        'payment_method' => $payment->payment_method,
                        'transaction_type' => 'expense',
                        'source' => $supplier->name,
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

    public function createPayment(Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);
        $purchase->load('supplier', 'branch');

        if ((float) $purchase->due_amount <= 0) {
            return redirect()
                ->route('purchases.show', $purchase->id)
                ->with('error', 'This purchase has no due amount remaining.');
        }

        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Purchase/Payment', [
            'purchase' => $purchase,
            'banks' => $banks,
        ]);
    }

    public function storePayment(Request $request, Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);
        $purchase->load('supplier', 'branch');

        $validated = $request->validate([
            'paid_at' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'notes' => 'nullable|string|max:2000',
        ]);

        if ((float) $validated['amount'] > (float) $purchase->due_amount) {
            return back()->withErrors([
                'amount' => 'Payment amount cannot exceed the current due amount.',
            ]);
        }

        DB::transaction(function () use ($purchase, $validated) {
            $supplier = $purchase->supplier ?? Supplier::findOrFail($purchase->supplier_id);
            $amount = (float) $validated['amount'];
            $newPaid = (float) $purchase->paid_amount + $amount;
            $newDue = max((float) $purchase->total_amount - $newPaid, 0);

            $payment = $this->createSupplierPaymentRecord($purchase, $supplier, $validated, $amount);

            $purchase->update([
                'paid_amount' => $newPaid,
                'due_amount' => $newDue,
                'payment_status' => $newDue <= 0 ? 'paid' : ($newPaid > 0 ? 'partial' : 'unpaid'),
            ]);

            Transaction::create([
                'name' => 'Purchase Payment - ' . $purchase->invoice_no,
                'payment_method' => $payment->payment_method,
                'transaction_type' => 'expense',
                'source' => $supplier->name,
                'amount' => $amount,
            ]);
        });

        return redirect()
            ->route('purchases.show', $purchase->id)
            ->with('success', 'Purchase payment recorded successfully.');
    }


    public function destroy(Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);

        if ($purchase->payments()->exists()) {
            return redirect()->route('purchases.index')
                ->with('error', 'Purchases with supplier payments cannot be deleted.');
        }

        DB::transaction(function () use ($purchase) {
            foreach ($purchase->items as $item) {
                $product = Product::find($item->product_id);
                $this->adjustBranchInventory($purchase->branch_id, $product, -1 * (int) $item->quantity);
            }

            $purchase->items()->delete();
            $purchase->delete();
        });

        return redirect()->route('purchases.index')->with('success', 'Purchase deleted successfully.');
    }

    private function accessibleBranchesQuery()
    {
        $user = request()->user()?->loadMissing('branch');

        return Branch::query()
            ->where('is_active', true)
            ->when($user?->branch_id, fn ($query) => $query->where('id', $user->branch_id))
            ->orderBy('name');
    }

    private function activeBranchId(): ?int
    {
        $user = request()->user()?->loadMissing('branch');

        return $user?->branch_id ?: request()->session()->get('active_branch_id');
    }

    private function ensureBranchAccessible(int $branchId): void
    {
        if (! $this->accessibleBranchesQuery()->whereKey($branchId)->exists()) {
            abort(403, 'You are not allowed to work with this branch.');
        }
    }

    private function ensurePurchaseInActiveBranch(Purchase $purchase): void
    {
        $activeBranchId = $this->activeBranchId();

        if ($activeBranchId && (int) $purchase->branch_id !== (int) $activeBranchId) {
            abort(403, 'You are not allowed to access purchases from another branch.');
        }
    }

    private function getBranchInventory(int $branchId, int $productId): BranchProductInventory
    {
        return BranchProductInventory::query()->firstOrCreate(
            [
                'branch_id' => $branchId,
                'product_id' => $productId,
            ],
            [
                'stock' => 0,
            ]
        );
    }

    private function adjustBranchInventory(int $branchId, Product $product, int $quantityChange): BranchProductInventory
    {
        $inventory = $this->getBranchInventory($branchId, $product->id);
        $newStock = (int) $inventory->stock + $quantityChange;

        if ($newStock < 0) {
            throw new \InvalidArgumentException("Not enough stock for {$product->name} in the selected branch.");
        }

        $inventory->update([
            'stock' => $newStock,
        ]);

        $product->refreshStockTotals();

        return $inventory->fresh();
    }

    private function recordStockMovement(
        Product $product,
        Branch $branch,
        string $movementType,
        int $quantityChange,
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?string $notes = null,
        ?int $balanceAfter = null
    ): void {
        StockLedger::create([
            'product_id' => $product->id,
            'branch_id' => $branch->id,
            'movement_type' => $movementType,
            'quantity_change' => $quantityChange,
            'balance_after' => $balanceAfter ?? (int) $product->stock,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'notes' => $notes,
            'causer_id' => auth()->id(),
        ]);
    }

    private function createSupplierPaymentRecord(
        Purchase $purchase,
        Supplier $supplier,
        array $paymentData,
        float $amount
    ): SupplierPayment {
        return SupplierPayment::create([
            'supplier_id' => $supplier->id,
            'purchase_id' => $purchase->id,
            'branch_id' => $purchase->branch_id,
            'payment_number' => 'SPY-' . Str::upper(Str::random(8)),
            'paid_at' => $paymentData['paid_at'] ?? $paymentData['purchase_date'],
            'amount' => $amount,
            'payment_method' => $paymentData['payment_method'] ?? 'cash',
            'bank_id' => ($paymentData['payment_method'] ?? 'cash') === 'bank'
                ? ($paymentData['bank_id'] ?? null)
                : null,
            'mfs' => ($paymentData['payment_method'] ?? 'cash') === 'mobile'
                ? ($paymentData['mfs'] ?? null)
                : null,
            'notes' => $paymentData['notes'] ?? 'Payment recorded from purchase form.',
            'received_by' => auth()->id(),
        ]);
    }
}
