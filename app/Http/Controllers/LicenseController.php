<?php

namespace App\Http\Controllers;

use App\Services\Licensing\LicenseService;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function __construct(
        protected LicenseService $licenseService
    ) {
    }

    public function activate(Request $request)
    {
        $validated = $request->validate([
            'license_key' => 'required|string|max:255',
            'licensed_email' => 'nullable|email|max:255',
        ]);

        try {
            $license = $this->licenseService->activate(
                $validated['license_key'],
                $validated['licensed_email'] ?? null
            );
        } catch (\Throwable $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return to_route('settings.licensing')->with(
            'success',
            sprintf('%s plan activated successfully.', $this->licenseService->planLabel($license->plan))
        );
    }

    public function refresh()
    {
        try {
            $license = $this->licenseService->refresh();
        } catch (\Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }

        if (! $license) {
            return back()->with('error', 'No license has been activated yet.');
        }

        return back()->with('success', 'License validated successfully.');
    }

    public function destroy()
    {
        $this->licenseService->deactivate();

        return to_route('settings.licensing')->with('success', 'License removed from this installation.');
    }
}
