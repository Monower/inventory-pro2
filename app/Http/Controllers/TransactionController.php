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
        $transaction = new Transaction();
        $transaction->name = $request->name;
        $transaction->payment_method = $request->paymentMethod;
        $transaction->transaction_type = $request->transaction_type;
        $transaction->source = $request->source;
        $transaction->amount = $request->amount;
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
        $transaction = Transaction::find($transaction_id);
        $transaction->name = $request->name;
        $transaction->payment_method = $request->paymentMethod;
        $transaction->transaction_type = $request->transaction_type;
        $transaction->source = $request->source;
        $transaction->amount = $request->amount;
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
