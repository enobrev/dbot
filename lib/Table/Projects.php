<?php
    namespace DBot\Table;

    use Enobrev\ORM\Db;
    use Enobrev\ORM;
    use Enobrev\SQLBuilder;

    class Projects extends ORM\Tables {
        /**
         * @return Project
         */
        public static function getTable() {
            return new Project;
        }

    }