#!/usr/bin/env bash

# meant to be called from project root

php vendor/bin/generate_tables.php -j ./sql.json -n DBot\\Table -o lib/Table

sed -i 's/use Enobrev\\ORM\\Table;/use Enobrev\\ORM;/g' lib/Table/*.php
sed -i 's/use Enobrev\\ORM\\Tables;/use Enobrev\\ORM;/g' lib/Table/*.php
sed -i 's/extends Table/extends ORM\\Table/g' lib/Table/*.php
sed -i 's/extends Tables/extends ORM\\Tables/g' lib/Table/*.php