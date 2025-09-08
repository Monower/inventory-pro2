<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;

class DashboardController extends Controller
{
    public function index(){
        $total_product_count = Product::count();
        $total_product_price = Product::sum('price');
        $total_customer_count = Customer::count();
        $total_staff_count = Staff::count();
        $total_added_money = Transaction::where(['transaction_type'=>'add_money'])->sum('amount');
        $total_expenses = Transaction::where(['transaction_type'=>'expense'])->sum('amount');

        $data = [
            [
                "title" => "Total Product Count",
                "heading" => $total_product_count,
                "icon" => "FiBox"
            ],
            [
                "title" => "Total Product price",
                "heading" => (int)$total_product_price." TK",
                "icon" => "FaProductHunt"
            ],
            [
                "title" => "Total sold value",
                "heading" => 0,
                "icon" => "CiDollar"
            ],
            [
                "title" => "Total order Count",
                "heading" => 0,
                "icon" => "LuTruck"
            ],
            [
                "title" => "Total customer Count",
                "heading" => $total_customer_count,
                "icon" => "FaRegUserCircle"
            ],
            [
                "title" => "Total staff Count",
                "heading" => $total_staff_count,
                "icon" => "FaUserFriends"
            ],
            [
                "title" => "Total added money",
                "heading" => $total_added_money." TK",
                "icon" => "FaSackDollar"
            ],
            [
                "title" => "Total expenses",
                "heading" => $total_expenses." TK",
                "icon" => "MdOutlineMoneyOff"
            ],
        ];



        return Inertia::render('Dashboard', [
            'data' => $data
        ]);
    }
}
