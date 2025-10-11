<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        $total_product_count = Product::count();
        $total_product_price = Product::select(DB::raw('SUM(selling_price * stock) as total'))->value('total');
        $total_customer_count = Customer::count();
        $total_staff_count = Staff::count();
        $total_added_money = Transaction::where(['transaction_type' => 'add_money'])->sum('amount');
        $total_expenses = Transaction::where(['transaction_type' => 'expense'])->sum('amount');
        $total_order_count = Transaction::count();
        $total_sold_value = Order::where(['payment_status' => 'paid'])->sum('paid_amount');

        $data = [
            [
                "title" => "Total Product Count",
                "heading" => $total_product_count,
                "icon" => "FiBox"
            ],
            [
                "title" => "Total Product price",
                "heading" => (int)$total_product_price . " TK",
                "icon" => "FaProductHunt"
            ],
            [
                "title" => "Total sold value",
                "heading" => (int)$total_sold_value . " TK",
                "icon" => "CiDollar"
            ],
            [
                "title" => "Total order Count",
                "heading" => $total_order_count,
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
                "heading" => $total_added_money . " TK",
                "icon" => "FaSackDollar"
            ],
            [
                "title" => "Total expenses",
                "heading" => $total_expenses . " TK",
                "icon" => "MdOutlineMoneyOff"
            ],
        ];



        return Inertia::render('Dashboard', [
            'data' => $data
        ]);
    }
}
