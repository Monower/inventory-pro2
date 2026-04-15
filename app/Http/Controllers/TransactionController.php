<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $transactions = $this->filteredTransactionsQuery($q)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function exportExcel()
    {
        $q = trim((string) request()->query('q', ''));

        $rows = $this->filteredTransactionsQuery($q)
            ->latest()
            ->get()
            ->values()
            ->map(fn (Transaction $transaction, int $index) => [
                $index + 1,
                $transaction->name,
                $transaction->transaction_date,
                $this->formatPaymentMethod($transaction->payment_method),
                $this->formatTransactionType($transaction->transaction_type),
                $transaction->source ?: 'N/A',
                $transaction->destination ?: 'N/A',
                $transaction->bank_name ?: 'N/A',
                $transaction->branch_name ?: 'N/A',
                $transaction->transaction_id ?: 'N/A',
                (float) $transaction->amount,
                optional($transaction->created_at)->format('Y-m-d H:i:s'),
            ]);

        return Excel::download(new TransactionsExport($rows), 'transactions.xlsx');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('transaction/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'transaction_date' => ['nullable', 'date'],
            'paymentMethod' => ['required', 'string', 'max:255'],
            'transaction_type' => ['required', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:255'],
            'destination' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = new Transaction();
        $transaction->name = $validated['name'];
        $transaction->transaction_date = $validated['transaction_date'] ?? null;
        $transaction->payment_method = $validated['paymentMethod'];
        $transaction->transaction_type = $validated['transaction_type'];
        $transaction->source = $validated['transaction_type'] === 'expense' ? '' : ($validated['source'] ?? '');
        $transaction->destination = $validated['transaction_type'] === 'expense' ? ($validated['destination'] ?? null) : null;
        $transaction->amount = $validated['amount'];
        $transaction->bank_name = $validated['bank_name'] ?? null;
        $transaction->branch_name = $validated['branch_name'] ?? null;
        $transaction->transaction_id = $validated['transaction_id'] ?? null;
        $transaction->save();
        return to_route('transactions.index');
    }

    /**
     * Display the specified resource.
     */
    public function show($transaction_id)
    {
        $transaction = Transaction::findOrFail($transaction_id);

        return Inertia::render('transaction/show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($transaction_id)
    {
        $transaction = Transaction::find($transaction_id);
        return Inertia::render('transaction/edit', ['transaction' => $transaction]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$transaction_id)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'transaction_date' => ['nullable', 'date'],
            'paymentMethod' => ['required', 'string', 'max:255'],
            'transaction_type' => ['required', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:255'],
            'destination' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction = Transaction::find($transaction_id);
        $transaction->name = $validated['name'];
        $transaction->transaction_date = $validated['transaction_date'] ?? null;
        $transaction->payment_method = $validated['paymentMethod'];
        $transaction->transaction_type = $validated['transaction_type'];
        $transaction->source = $validated['transaction_type'] === 'expense' ? '' : ($validated['source'] ?? '');
        $transaction->destination = $validated['transaction_type'] === 'expense' ? ($validated['destination'] ?? null) : null;
        $transaction->amount = $validated['amount'];
        $transaction->bank_name = $validated['bank_name'] ?? null;
        $transaction->branch_name = $validated['branch_name'] ?? null;
        $transaction->transaction_id = $validated['transaction_id'] ?? null;
        $transaction->save();
        return to_route('transactions.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction, $transaction_id)
    {
        $transaction = Transaction::find($transaction_id);
        $transaction->delete();
        return to_route('transactions.index');
    }

    protected function filteredTransactionsQuery(string $q)
    {
        return Transaction::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('payment_method', 'like', "%{$q}%")
                        ->orWhere('transaction_type', 'like', "%{$q}%")
                        ->orWhere('source', 'like', "%{$q}%")
                        ->orWhere('destination', 'like', "%{$q}%")
                        ->orWhere('bank_name', 'like', "%{$q}%")
                        ->orWhere('amount', 'like', "%{$q}%");
                });
            });
    }

    protected function formatPaymentMethod(?string $value): string
    {
        return [
            'cash' => 'Cash',
            'bank' => 'Bank',
            'mobileBanking' => 'Mobile banking',
        ][$value] ?? ($value ?: 'N/A');
    }

    protected function formatTransactionType(?string $value): string
    {
        return [
            'add_money' => 'Add money',
            'expense' => 'Expense',
        ][$value] ?? ($value ?: 'N/A');
    }
}
