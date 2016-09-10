#!/usr/bin/env bash

# meant to be called from project root

php vendor/bin/generate_tables.php -j ./sql.json -n DBot\\Table -o lib/Table