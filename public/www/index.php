<?php
    require __DIR__ . '/../../.config.local.php';

    $bIsCLI = php_sapi_name() == 'cli' && empty($_SERVER['REMOTE_ADDR']);
?>
<!doctype html>
<html lang="en">
    <head>
        <title><?= $bIsCLI ? '': '* ' ?><?= APP_NAME ?></title>

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">

        <meta charset="utf-8" />
    </head>
    <body>
        www
    </body>
</html>
