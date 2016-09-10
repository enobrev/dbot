<?php
    $sLocalConfig = __DIR__ . '/.config.local.php';

    if (!file_exists($sLocalConfig)) {
        echo "Local config file is missing";
        exit(1);
    }

    require_once $sLocalConfig;
    require_once __DIR__ . '/vendor/autoload.php';

    use Enobrev\Log;
    use Enobrev\API\Route;
    use Enobrev\API\Response;
    use Enobrev\API\DataMap;

    Log::setName(LOGGER_NAME);
    DataMap::setDataFile(__DIR__ . '/lib/API/DataMap.json');
    Route::init(__DIR__ . '/lib/API', 'DBot\\API', 'DBot\\Table', Enobrev\API\Rest::class, ['v1']);
    Response::init(URI_DOMAIN, URI_SCHEME, URIS_ALLOW);