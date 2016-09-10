<?php
    namespace DBot\Table;

    use Enobrev\ORM\Db;
    use Enobrev\ORM;
    use Enobrev\SQLBuilder;

    class ColumnTypes extends ORM\Tables {
        /**
         * @return ColumnType
         */
        public static function getTable() {
            return new ColumnType;
        }

    }