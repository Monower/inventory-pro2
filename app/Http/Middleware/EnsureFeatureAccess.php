<?php

namespace App\Http\Middleware;

use App\Services\Licensing\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureAccess
{
    public function __construct(
        protected LicenseService $licenseService
    ) {
    }

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $access = $this->licenseService->evaluateFeatureAccess($feature);

        if ($access['allowed']) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $access['message'],
                'required_plan' => $access['required_plan'],
            ], 403);
        }

        if ($request->isMethod('get')) {
            return redirect()->route('settings.index')->with('error', $access['message']);
        }

        return back()->withInput()->with('error', $access['message']);
    }
}
