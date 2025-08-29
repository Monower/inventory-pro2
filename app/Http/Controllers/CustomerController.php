<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index(){
        $customers = Customer::all();
        return Inertia::render('customer/index', compact('customers'));
    }


    public function create(){
        return Inertia::render('customer/create');
    }


    public function store(Request $request){
        $customer = new Customer();
        $customer->name = $request->name;
        $customer->email = $request->email;
        $customer->phone = $request->phone;
        $customer->address = $request->address;
        $customer->save();

        return to_route('customers.index');
    }


    public function edit($customer_id){
        $customer = Customer::find($customer_id);
        return Inertia::render('customer/edit', ['customer' => $customer]);
    }


    public function update(Request $request, $customer_id){
        $customer = Customer::find($customer_id);
        $customer->name = $request->name;
        $customer->email = $request->email;
        $customer->phone = $request->phone;
        $customer->address = $request->address;
        $customer->save();

        return to_route('customers.index');
    }


    public function destroy($customer_id){
        $customer = Customer::find($customer_id);
        $customer->delete();
        return to_route('customers.index');
    }
}
