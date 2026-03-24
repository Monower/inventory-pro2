<?php

namespace App\Http\Middleware;

use App\Services\Licensing\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLicenseIsActive
{
    public function __construct(
        protected LicenseService $licenseService
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $access = $this->licenseService->evaluateFeatureAccess('customers');

        if ($access['allowed']) {
            return $next($request);
        }

        return $this->deny($request, $access['message']);
    }

    protected function deny(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], 403);
        }

        if ($request->isMethod('get')) {
            return redirect()->route('settings.licensing')->with('error', $message);
        }

        return back()->withInput()->with('error', $message);
    }
}
