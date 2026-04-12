<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()?->isSuperAdmin() && !$request->user()?->isOperatingInTenantContext()) {
            return redirect()->route('super-admin.dashboard');
        }

        return Inertia::render('Dashboard', [
            'data' => [],
        ]);
    }
}
