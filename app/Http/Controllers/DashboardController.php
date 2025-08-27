<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index(){
        $total_product_count = Product::count();

        $data = [
            [
                "title" => "Total Product Count",
                "heading" => $total_product_count,
                "icon" => "FiBox"
            ],
            [
                "title" => "Total Product price",
                "heading" => 0,
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
                "heading" => 0,
                "icon" => "FaRegUserCircle"
            ],
            [
                "title" => "Total staff Count",
                "heading" => 0,
                "icon" => "FaUserFriends"
            ],
            [
                "title" => "Total added money",
                "heading" => 0,
                "icon" => "FaSackDollar"
            ],
            [
                "title" => "Total expenses",
                "heading" => 0,
                "icon" => "MdOutlineMoneyOff"
            ],
        ];



        return Inertia::render('Dashboard', [
            'data' => $data
        ]);
    }
}
