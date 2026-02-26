<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index(Request $request){
        $q = trim((string) $request->query('q', ''));

        $customers = Customer::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('address', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('customer/index', [
            'customers' => $customers,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }


    public function create(){
        return Inertia::render('customer/create');
    }


    public function store(Request $request){
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
        ]);

        Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? '',
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? '',
        ]);

        return to_route('customers.index')->with('success', 'Customer created successfully.');
    }


    public function edit($customer_id){
        $customer = Customer::find($customer_id);
        return Inertia::render('customer/edit', ['customer' => $customer]);
    }


    public function update(Request $request, $customer_id){

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
        ]);

        $customer = Customer::find($customer_id);

        if (!$customer) {
            return to_route('customers.index')->with('error', 'Customer not found.');
        }

        $customer->update([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? '',
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? '',
        ]);

        return to_route('customers.index')->with('success', 'Customer updated successfully.');
    }


    public function destroy($customer_id){
        $customer = Customer::find($customer_id);
        if (!$customer) {
            return to_route('customers.index')->with('error', 'Customer not found.');
        }
        $customer->delete();
        return to_route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
