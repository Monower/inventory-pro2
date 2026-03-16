<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchProductInventory;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StockTransferController extends Controller
{
    public function index(Request $request)
    {
        $activeBranchId = $this->activeBranchId();
        $q = trim((string) $request->query('q', ''));
        $status = trim((string) $request->query('status', ''));

        $transfers = StockTransfer::query()
            ->with(['sourceBranch', 'destinationBranch', 'requestedBy'])
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->where(function ($branchQuery) use ($activeBranchId) {
                    $branchQuery->where('source_branch_id', $activeBranchId)
                        ->orWhere('destination_branch_id', $activeBranchId);
                });
            })
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('transfer_number', 'like', "%{$q}%")
                        ->orWhere('status', 'like', "%{$q}%")
                        ->orWhere('notes', 'like', "%{$q}%")
                        ->orWhereHas('sourceBranch', fn ($branchQuery) => $branchQuery->where('name', 'like', "%{$q}%"))
                        ->orWhereHas('destinationBranch', fn ($branchQuery) => $branchQuery->where('name', 'like', "%{$q}%"));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('stockTransfers/index', [
            'transfers' => $transfers,
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
            'statuses' => ['requested', 'approved', 'rejected', 'in_transit', 'completed'],
            'activeBranchId' => $activeBranchId,
        ]);
    }

    public function create()
    {
        $activeBranchId = $this->activeBranchId();

        return Inertia::render('stockTransfers/create', [
            'products' => Product::query()
                ->with(['branchInventories' => fn ($query) => $query->select('id', 'branch_id', 'product_id', 'stock')])
                ->select('id', 'name', 'stock')
                ->orderBy('name')
                ->get(),
            'sourceBranches' => $this->sourceBranchesQuery()->get(['id', 'name', 'code']),
            'destinationBranches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'activeBranchId' => $activeBranchId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_branch_id' => 'required|exists:branches,id|different:destination_branch_id',
            'destination_branch_id' => 'required|exists:branches,id',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|distinct|exists:products,id',
            'items.*.requested_quantity' => 'required|integer|min:1',
        ]);

        $this->ensureSourceBranchAccessible((int) $validated['source_branch_id']);
        $this->ensureBranchExistsAndActive((int) $validated['destination_branch_id']);

        $transfer = DB::transaction(function () use ($validated) {
            $transfer = StockTransfer::create([
                'transfer_number' => 'TRN-' . Str::upper(Str::random(8)),
                'source_branch_id' => $validated['source_branch_id'],
                'destination_branch_id' => $validated['destination_branch_id'],
                'status' => 'requested',
                'notes' => $validated['notes'] ?? null,
                'requested_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $transfer->items()->create([
                    'product_id' => $item['product_id'],
                    'requested_quantity' => $item['requested_quantity'],
                ]);
            }

            return $transfer;
        });

        return to_route('stock-transfers.show', $transfer->id)->with('success', 'Stock transfer request created successfully.');
    }

    public function show(StockTransfer $stockTransfer)
    {
        $this->ensureTransferVisible($stockTransfer);

        $stockTransfer->load([
            'sourceBranch',
            'destinationBranch',
            'requestedBy',
            'approvedBy',
            'dispatchedBy',
            'receivedBy',
            'items.product.branchInventories',
        ]);

        return Inertia::render('stockTransfers/show', [
            'transfer' => $stockTransfer,
            'canApproveFromActiveBranch' => $this->canOperateFromSourceBranch($stockTransfer),
            'canReceiveFromActiveBranch' => $this->canOperateFromDestinationBranch($stockTransfer),
        ]);
    }

    public function approve(Request $request, StockTransfer $stockTransfer)
    {
        $this->ensureTransferVisible($stockTransfer);
        $this->ensureSourceBranchOperation($stockTransfer);

        if ($stockTransfer->status !== 'requested') {
            return back()->with('error', 'Only requested transfers can be approved.');
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:stock_transfer_items,id',
            'items.*.approved_quantity' => 'required|integer|min:1',
        ]);

        $itemPayload = collect($validated['items'])->keyBy(fn ($item) => (int) $item['id']);

        DB::transaction(function () use ($stockTransfer, $itemPayload) {
            $stockTransfer->loadMissing('items.product');

            foreach ($stockTransfer->items as $item) {
                $payload = $itemPayload->get($item->id);

                if (! $payload) {
                    throw new \InvalidArgumentException('Approval quantities are incomplete.');
                }

                $approvedQuantity = min((int) $payload['approved_quantity'], (int) $item->requested_quantity);
                $inventory = $this->getBranchInventory($stockTransfer->source_branch_id, $item->product_id);

                if ((int) $inventory->stock < $approvedQuantity) {
                    throw new \InvalidArgumentException("Not enough stock for {$item->product->name} in the source branch.");
                }

                $item->update([
                    'approved_quantity' => $approvedQuantity,
                ]);
            }

            $stockTransfer->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);
        });

        return back()->with('success', 'Transfer approved successfully.');
    }

    public function reject(Request $request, StockTransfer $stockTransfer)
    {
        $this->ensureTransferVisible($stockTransfer);
        $this->ensureSourceBranchOperation($stockTransfer);

        if ($stockTransfer->status !== 'requested') {
            return back()->with('error', 'Only requested transfers can be rejected.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:2000',
        ]);

        $stockTransfer->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Transfer rejected successfully.');
    }

    public function dispatch(StockTransfer $stockTransfer)
    {
        $this->ensureTransferVisible($stockTransfer);
        $this->ensureSourceBranchOperation($stockTransfer);

        if ($stockTransfer->status !== 'approved') {
            return back()->with('error', 'Only approved transfers can be dispatched.');
        }

        DB::transaction(function () use ($stockTransfer) {
            $stockTransfer->loadMissing('items.product', 'sourceBranch', 'destinationBranch');

            $stockTransfer->update([
                'status' => 'in_transit',
                'dispatched_by' => auth()->id(),
                'dispatched_at' => now(),
            ]);

            foreach ($stockTransfer->items as $item) {
                $approvedQuantity = (int) ($item->approved_quantity ?? 0);

                if ($approvedQuantity <= 0) {
                    throw new \InvalidArgumentException("Approved quantity is missing for {$item->product->name}.");
                }

                $inventory = $this->adjustBranchInventory($stockTransfer->source_branch_id, $item->product, -1 * $approvedQuantity);

                $this->recordStockMovement(
                    $item->product,
                    $stockTransfer->sourceBranch,
                    'transfer_out',
                    -1 * $approvedQuantity,
                    StockTransfer::class,
                    $stockTransfer->id,
                    "Dispatched to {$stockTransfer->destinationBranch->name} via transfer {$stockTransfer->transfer_number}.",
                    $inventory->stock
                );
            }
        });

        return back()->with('success', 'Transfer dispatched and marked as in transit.');
    }

    public function receive(StockTransfer $stockTransfer)
    {
        $this->ensureTransferVisible($stockTransfer);
        $this->ensureDestinationBranchOperation($stockTransfer);

        if ($stockTransfer->status !== 'in_transit') {
            return back()->with('error', 'Only in-transit transfers can be received.');
        }

        DB::transaction(function () use ($stockTransfer) {
            $stockTransfer->loadMissing('items.product', 'sourceBranch', 'destinationBranch');

            $stockTransfer->update([
                'status' => 'completed',
                'received_by' => auth()->id(),
                'received_at' => now(),
            ]);

            foreach ($stockTransfer->items as $item) {
                $receivedQuantity = (int) ($item->approved_quantity ?? 0);

                if ($receivedQuantity <= 0) {
                    throw new \InvalidArgumentException("Approved quantity is missing for {$item->product->name}.");
                }

                $inventory = $this->adjustBranchInventory($stockTransfer->destination_branch_id, $item->product, $receivedQuantity);

                $item->update([
                    'received_quantity' => $receivedQuantity,
                ]);

                $this->recordStockMovement(
                    $item->product,
                    $stockTransfer->destinationBranch,
                    'transfer_in',
                    $receivedQuantity,
                    StockTransfer::class,
                    $stockTransfer->id,
                    "Received from {$stockTransfer->sourceBranch->name} via transfer {$stockTransfer->transfer_number}.",
                    $inventory->stock
                );
            }
        });

        return back()->with('success', 'Transfer received successfully.');
    }

    private function sourceBranchesQuery()
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

    private function ensureSourceBranchAccessible(int $branchId): void
    {
        if (! $this->sourceBranchesQuery()->whereKey($branchId)->exists()) {
            abort(403, 'You are not allowed to create transfers from this branch.');
        }
    }

    private function ensureBranchExistsAndActive(int $branchId): void
    {
        if (! Branch::query()->whereKey($branchId)->where('is_active', true)->exists()) {
            abort(403, 'The selected branch is not available.');
        }
    }

    private function ensureTransferVisible(StockTransfer $stockTransfer): void
    {
        $activeBranchId = $this->activeBranchId();

        if (
            $activeBranchId &&
            (int) $stockTransfer->source_branch_id !== (int) $activeBranchId &&
            (int) $stockTransfer->destination_branch_id !== (int) $activeBranchId
        ) {
            abort(403, 'You are not allowed to access transfers outside the active branch.');
        }
    }

    private function canOperateFromSourceBranch(StockTransfer $stockTransfer): bool
    {
        $activeBranchId = $this->activeBranchId();

        return ! $activeBranchId || (int) $stockTransfer->source_branch_id === (int) $activeBranchId;
    }

    private function canOperateFromDestinationBranch(StockTransfer $stockTransfer): bool
    {
        $activeBranchId = $this->activeBranchId();

        return ! $activeBranchId || (int) $stockTransfer->destination_branch_id === (int) $activeBranchId;
    }

    private function ensureSourceBranchOperation(StockTransfer $stockTransfer): void
    {
        if (! $this->canOperateFromSourceBranch($stockTransfer)) {
            abort(403, 'Switch to the source branch to approve or dispatch this transfer.');
        }
    }

    private function ensureDestinationBranchOperation(StockTransfer $stockTransfer): void
    {
        if (! $this->canOperateFromDestinationBranch($stockTransfer)) {
            abort(403, 'Switch to the destination branch to receive this transfer.');
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
}
