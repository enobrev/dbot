<?php
    require __DIR__ . '/../../.config.local.php';

    $bIsCLI = php_sapi_name() == 'cli' && empty($_SERVER['REMOTE_ADDR']);
?>
<!doctype html>
<html lang="en">
    <head>
        <title><?= $bIsCLI ? '': '* ' ?><?= APP_NAME ?></title>

        <meta charset="utf-8" />

        <script src="/jspm/system.js"></script>
        <script src="/config.js"></script>

        <?php if ($bIsCLI) {?>
            <script src="/build.js"></script>
        <?php } else if(file_exists(__DIR__ . '/.bundles')) { ?>
            <script src="/.bundles/babel.js"></script>
            <script src="/.bundles/dependencies.js"></script>
        <?php } ?>
    </head>
    <body>
        <div id="root"></div>

        <script>
            var API_BASE_URL = '<?= URI_API_DEFAULT ?>';

            System.import('/components/App');
        </script>
    </body>
</html>
