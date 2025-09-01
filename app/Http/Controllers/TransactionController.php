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
        $transactions = Transaction::all();
        return Inertia::render('transaction/index', [
            'transactions' => $transactions
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
        $transaction->payment_method = $request->payment_method;
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
        $transaction->payment_method = $request->payment_method;
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
