<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchProductInventory;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockLedger;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $activeBranchId = $this->activeBranchId();
        $q = trim((string) request()->query('q', ''));

        $purchase_items = PurchaseItem::with(['purchase.branch', 'product'])
            ->when($activeBranchId, fn ($query) => $query->whereHas('purchase', fn ($purchaseQuery) => $purchaseQuery->where('branch_id', $activeBranchId)))
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
        $activeBranchId = $this->activeBranchId();
        $products = Product::query()
            ->with(['branchInventories' => fn ($query) => $query->select('id', 'branch_id', 'product_id', 'stock')])
            ->select('id', 'name', 'buying_price', 'stock')
            ->orderBy('name')
            ->get();
        $branches = $this->accessibleBranchesQuery()->get(['id', 'name', 'code']);
        return Inertia::render('Purchase/Create', [
            'products' => $products,
            'branches' => $branches,
            'activeBranchId' => $activeBranchId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        $this->ensureBranchAccessible((int) $validated['branch_id']);

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

                $branch = Branch::findOrFail($validated['branch_id']);

                $purchase = Purchase::create([
                    'invoice_no' => $invoice,
                    'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                    'branch_id' => $branch->id,
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
        $this->ensurePurchaseInActiveBranch($purchase);
        $purchase->load('items.product');
        $products = Product::query()
            ->with(['branchInventories' => fn ($query) => $query->select('id', 'branch_id', 'product_id', 'stock')])
            ->select('id', 'name', 'buying_price', 'stock')
            ->orderBy('name')
            ->get();
        $branches = $this->accessibleBranchesQuery()->get(['id', 'name', 'code']);
        return Inertia::render('Purchase/Edit', [
            'purchase' => $purchase,
            'products' => $products,
            'branches' => $branches,
        ]);
    }

    public function update(Request $request, Purchase $purchase)
    {
        $this->ensurePurchaseInActiveBranch($purchase);
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'purchase_date' => 'required|date',
            'payment_status' => 'required|in:paid,partial,unpaid',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.buying_price' => 'required|numeric|min:0',
        ]);

        $this->ensureBranchAccessible((int) $validated['branch_id']);

        try {
            DB::transaction(function () use ($validated, $purchase) {
                $totalAmount = 0;

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
                    'supplier_name' => $validated['supplier_name'] ?? 'Unknown',
                    'branch_id' => $branch->id,
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
        $this->ensurePurchaseInActiveBranch($purchase);
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

        $product->update([
            'stock' => (int) $product->branchInventories()->sum('stock'),
        ]);

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
}
