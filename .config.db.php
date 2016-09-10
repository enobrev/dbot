<?php
    require __DIR__ . '/.config.php';

    use Enobrev\ORM\Db;

    $oDb = Db::getInstance(Db::defaultMySQLPDO(DB_HOST, DB_USER, DB_PASS, DB_NAME));