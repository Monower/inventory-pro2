<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockLedger;
use Inertia\Inertia;

class StockLedgerController extends Controller
{
    public function index()
    {
        $productId = request()->query('product_id');
        $movementType = trim((string) request()->query('movement_type', ''));
        $dateFrom = request()->query('date_from');
        $dateTo = request()->query('date_to');

        $ledgers = StockLedger::query()
            ->with('product', 'causer')
            ->when($productId, fn ($query) => $query->where('product_id', $productId))
            ->when($movementType !== '', fn ($query) => $query->where('movement_type', $movementType))
            ->when($dateFrom, fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('stockLedger/index', [
            'ledgers' => $ledgers,
            'products' => Product::query()->select('id', 'name')->orderBy('name')->get(),
            'movementTypes' => StockLedger::query()
                ->select('movement_type')
                ->distinct()
                ->orderBy('movement_type')
                ->pluck('movement_type'),
            'filters' => [
                'product_id' => $productId,
                'movement_type' => $movementType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
