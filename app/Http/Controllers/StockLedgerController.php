<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Product;
use App\Models\StockLedger;
use Inertia\Inertia;

class StockLedgerController extends Controller
{
    public function index()
    {
        $activeBranchId = $this->activeBranchId();
        $productId = request()->query('product_id');
        $branchId = request()->query('branch_id', $activeBranchId);
        $movementType = trim((string) request()->query('movement_type', ''));
        $dateFrom = request()->query('date_from');
        $dateTo = request()->query('date_to');

        $ledgers = StockLedger::query()
            ->with('product', 'branch', 'causer')
            ->when($productId, fn ($query) => $query->where('product_id', $productId))
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when($movementType !== '', fn ($query) => $query->where('movement_type', $movementType))
            ->when($dateFrom, fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('stockLedger/index', [
            'ledgers' => $ledgers,
            'products' => Product::query()->select('id', 'name')->orderBy('name')->get(),
            'branches' => $this->accessibleBranchesQuery()->select('id', 'name')->get(),
            'movementTypes' => StockLedger::query()
                ->select('movement_type')
                ->distinct()
                ->orderBy('movement_type')
                ->pluck('movement_type'),
            'filters' => [
                'product_id' => $productId,
                'branch_id' => $branchId,
                'movement_type' => $movementType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
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
}
