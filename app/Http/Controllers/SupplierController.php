<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\Branch;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $activeBranchId = $this->activeBranchId();

        $suppliers = Supplier::query()
            ->withCount([
                'purchases as purchases_count' => fn ($query) => $query->when($activeBranchId, fn ($purchaseQuery) => $purchaseQuery->where('branch_id', $activeBranchId)),
            ])
            ->withSum([
                'purchases as total_purchase_amount' => fn ($query) => $query->when($activeBranchId, fn ($purchaseQuery) => $purchaseQuery->where('branch_id', $activeBranchId)),
            ], 'total_amount')
            ->withSum([
                'purchases as total_paid_amount' => fn ($query) => $query->when($activeBranchId, fn ($purchaseQuery) => $purchaseQuery->where('branch_id', $activeBranchId)),
            ], 'paid_amount')
            ->withSum([
                'purchases as total_due_amount' => fn ($query) => $query->when($activeBranchId, fn ($purchaseQuery) => $purchaseQuery->where('branch_id', $activeBranchId)),
            ], 'due_amount')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('contact_person', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('suppliers/create');
    }

    public function store(Request $request)
    {
        $validated = $this->validateSupplier($request);

        Supplier::create($validated);

        return to_route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $this->validateSupplier($request, $supplier->id);

        $supplier->update($validated);

        return to_route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function show(Supplier $supplier)
    {
        $activeBranchId = $this->activeBranchId();

        $purchases = Purchase::query()
            ->with('branch')
            ->where('supplier_id', $supplier->id)
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
            ->latest('purchase_date')
            ->get();

        $payments = SupplierPayment::query()
            ->with('bank', 'branch', 'purchase', 'receivedBy')
            ->where('supplier_id', $supplier->id)
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
            ->latest('paid_at')
            ->get();

        $summary = [
            'purchase_count' => $purchases->count(),
            'total_purchase_amount' => (float) $purchases->sum('total_amount'),
            'total_paid_amount' => (float) $purchases->sum('paid_amount'),
            'total_due_amount' => (float) $purchases->sum('due_amount'),
            'payments_recorded' => (float) $payments->sum('amount'),
        ];

        return Inertia::render('suppliers/show', [
            'supplier' => $supplier,
            'purchases' => $purchases,
            'payments' => $payments,
            'summary' => $summary,
        ]);
    }

    public function createPayment(Supplier $supplier)
    {
        $activeBranchId = $this->activeBranchId();
        $banks = Bank::query()->select('id', 'name')->orderBy('name')->get();
        $openPurchases = Purchase::query()
            ->where('supplier_id', $supplier->id)
            ->where('due_amount', '>', 0)
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
            ->latest('purchase_date')
            ->get(['id', 'invoice_no', 'due_amount', 'purchase_date']);

        return Inertia::render('suppliers/payment', [
            'supplier' => $supplier,
            'banks' => $banks,
            'openPurchases' => $openPurchases,
            'activeBranchId' => $activeBranchId,
        ]);
    }

    public function storePayment(Request $request, Supplier $supplier)
    {
        $activeBranchId = $this->activeBranchId();

        $validated = $request->validate([
            'purchase_id' => 'nullable|exists:purchases,id',
            'paid_at' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,mobile',
            'bank_id' => 'nullable|required_if:payment_method,bank|exists:banks,id',
            'mfs' => 'nullable|required_if:payment_method,mobile|in:bkash,nagad,rocket',
            'notes' => 'nullable|string|max:2000',
        ]);

        $purchase = null;

        if (!empty($validated['purchase_id'])) {
            $purchase = Purchase::query()
                ->where('supplier_id', $supplier->id)
                ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
                ->findOrFail($validated['purchase_id']);

            if ((float) $validated['amount'] > (float) $purchase->due_amount) {
                return back()->withErrors([
                    'amount' => 'Payment amount cannot exceed the selected purchase due amount.',
                ]);
            }
        } else {
            $totalDue = (float) Purchase::query()
                ->where('supplier_id', $supplier->id)
                ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
                ->sum('due_amount');

            if ((float) $validated['amount'] > $totalDue) {
                return back()->withErrors([
                    'amount' => 'Payment amount cannot exceed the supplier total due amount.',
                ]);
            }
        }

        DB::transaction(function () use ($validated, $supplier, $purchase, $activeBranchId) {
            $remainingAmount = (float) $validated['amount'];
            $targetPurchases = $purchase
                ? collect([$purchase])
                : Purchase::query()
                    ->where('supplier_id', $supplier->id)
                    ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId))
                    ->where('due_amount', '>', 0)
                    ->orderBy('purchase_date')
                    ->get();

            foreach ($targetPurchases as $targetPurchase) {
                if ($remainingAmount <= 0) {
                    break;
                }

                $payable = min((float) $targetPurchase->due_amount, $remainingAmount);

                if ($payable <= 0) {
                    continue;
                }

                $payment = SupplierPayment::create([
                    'supplier_id' => $supplier->id,
                    'purchase_id' => $targetPurchase->id,
                    'branch_id' => $targetPurchase->branch_id,
                    'payment_number' => 'SPY-' . Str::upper(Str::random(8)),
                    'paid_at' => $validated['paid_at'],
                    'amount' => $payable,
                    'payment_method' => $validated['payment_method'],
                    'bank_id' => $validated['payment_method'] === 'bank' ? ($validated['bank_id'] ?? null) : null,
                    'mfs' => $validated['payment_method'] === 'mobile' ? ($validated['mfs'] ?? null) : null,
                    'notes' => $validated['notes'] ?? null,
                    'received_by' => auth()->id(),
                ]);

                $newPaid = (float) $targetPurchase->paid_amount + $payable;
                $newDue = max((float) $targetPurchase->total_amount - $newPaid, 0);

                $targetPurchase->update([
                    'paid_amount' => $newPaid,
                    'due_amount' => $newDue,
                    'payment_status' => $newDue <= 0 ? 'paid' : ($newPaid > 0 ? 'partial' : 'unpaid'),
                ]);

                Transaction::create([
                    'name' => 'Supplier Payment - ' . $targetPurchase->invoice_no,
                    'payment_method' => $payment->payment_method,
                    'transaction_type' => 'expense',
                    'source' => $supplier->name,
                    'amount' => $payable,
                ]);

                $remainingAmount -= $payable;
            }
        });

        return to_route('suppliers.show', $supplier->id)->with('success', 'Supplier payment recorded successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->purchases()->exists() || $supplier->payments()->exists()) {
            return to_route('suppliers.index')->with('error', 'Suppliers with purchases or payments cannot be deleted.');
        }

        $supplier->delete();

        return to_route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }

    private function validateSupplier(Request $request, ?int $supplierId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50|unique:suppliers,phone,' . $supplierId,
            'email' => 'nullable|email|max:255|unique:suppliers,email,' . $supplierId,
            'contact_person' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:2000',
            'is_active' => 'required|boolean',
        ]);
    }

    private function activeBranchId(): ?int
    {
        $user = request()->user()?->loadMissing('branch');

        return $user?->branch_id ?: request()->session()->get('active_branch_id');
    }
}
