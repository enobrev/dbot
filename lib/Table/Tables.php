<?php
    namespace DBot\Table;

    use Enobrev\ORM\Db;
    use Enobrev\ORM;
    use Enobrev\SQLBuilder;

    class Tables extends ORM\Tables {
        /**
         * @return Table
         */
        public static function getTable() {
            return new Table;
        }

    }