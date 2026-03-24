<?php

namespace App\Console\Commands;

use App\Services\Licensing\LicenseService;
use Illuminate\Console\Command;

class SyncLicenseCommand extends Command
{
    protected $signature = 'license:sync {--force : Sync even if the cached validation is still fresh}';

    protected $description = 'Refresh the locally cached license status from the remote licensing server.';

    public function handle(LicenseService $licenseService): int
    {
        if (! $licenseService->hasLicenseTable()) {
            $this->warn('licenses table does not exist yet.');

            return self::SUCCESS;
        }

        $license = $licenseService->current();

        if (! $license || ! $license->license_key) {
            $this->line('No activated license found.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $licenseService->shouldRefresh($license)) {
            $this->line('License cache is still fresh. Skipping remote sync.');

            return self::SUCCESS;
        }

        try {
            $license = $licenseService->refresh();
        } catch (\Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info(sprintf(
            'License sync completed. Status: %s. Plan: %s.',
            $license?->status ?? 'unknown',
            $license?->plan ?? 'none'
        ));

        return self::SUCCESS;
    }
}
