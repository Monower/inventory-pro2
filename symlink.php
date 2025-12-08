<?php
$targetFolder = '/home/sathytra/inventory-pro2/storage';
$linkFolder = '/home/sathytra/public_html/storage';
symlink($targetFolder, $linkFolder);
echo 'Symlink process successfully completed';
?>
