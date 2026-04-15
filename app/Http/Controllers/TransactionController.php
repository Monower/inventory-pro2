<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $transactions = Transaction::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('payment_method', 'like', "%{$q}%")
                        ->orWhere('transaction_type', 'like', "%{$q}%")
                        ->orWhere('source', 'like', "%{$q}%")
                        ->orWhere('amount', 'like', "%{$q}%");
                });
            })
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
        $transaction->source = $validated['source'] ?? '';
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
    public function show(Transaction $transaction)
    {
        //
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
        $transaction->source = $validated['source'] ?? '';
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
}
