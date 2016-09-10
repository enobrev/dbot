<?php
    namespace DBot\Table;

    use Enobrev\ORM\Db;
    use Enobrev\ORM\Tables;
    use Enobrev\SQLBuilder;

    class Tables extends Tables {
        /**
         * @return Table
         */
        public static function getTable() {
            return new Table;
        }

    }