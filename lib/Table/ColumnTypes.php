<?php
    namespace DBot\Table;

    use Enobrev\ORM\Db;
    use Enobrev\ORM\Tables;
    use Enobrev\SQLBuilder;

    class ColumnTypes extends Tables {
        /**
         * @return ColumnType
         */
        public static function getTable() {
            return new ColumnType;
        }

    }