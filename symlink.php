<?php

$targetFolder = '/home/sathytra/inventory-pro2/storage/app/public';
$linkFolder = '/home/sathytra/public_html/storage';

echo '<pre>';
echo "Inventory Pro storage symlink checker v2\n";
echo "Generated output from: " . __FILE__ . "\n\n";

clearstatcache(true, $linkFolder);
clearstatcache(true, $targetFolder);

echo "Target: {$targetFolder}\n";
echo "Link: {$linkFolder}\n\n";

if (! function_exists('symlink')) {
    exit("Failed: PHP symlink() function is disabled on this server.\n");
}

if (! is_dir($targetFolder)) {
    exit("Failed: target folder does not exist.\n");
}

if (! is_dir(dirname($linkFolder))) {
    exit("Failed: link parent folder does not exist: " . dirname($linkFolder) . "\n");
}

if (is_link($linkFolder)) {
    $currentTarget = readlink($linkFolder);

    echo "Existing symlink points to: {$currentTarget}\n";

    if ($currentTarget === $targetFolder) {
        exit("Success: symlink already exists and points to the correct folder.\n");
    }

    if (! unlink($linkFolder)) {
        exit("Failed: existing incorrect symlink could not be removed.\n");
    }

    echo "Removed old incorrect symlink.\n";
    clearstatcache(true, $linkFolder);
}

if (file_exists($linkFolder)) {
    exit("Failed: {$linkFolder} already exists and is not a symlink. Delete or rename it first, then run this file again.\n");
}

$created = @symlink($targetFolder, $linkFolder);

if (! $created) {
    $error = error_get_last();
    $message = $error['message'] ?? 'unknown error';

    exit("Failed: symlink could not be created. PHP error: {$message}\n");
}

clearstatcache(true, $linkFolder);

if (! is_link($linkFolder)) {
    exit("Failed: symlink() returned success, but the link was not found afterward.\n");
}

echo "Success: symlink created.\n";
echo "Public URL format is now: /storage/logos/example.jpg\n";

echo '</pre>';
