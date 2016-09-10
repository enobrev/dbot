#!/usr/bin/env bash

# meant to be called from project root

php vendor/bin/sql_to_json.php -h localhost -u dev -d dev_dbot -p
php vendor/bin/generate_data_map.php -j sql.json -o lib/API