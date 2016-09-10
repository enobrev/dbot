<?php
    namespace DBot\Table;

    use Enobrev\ORM\Table;
    use Enobrev\ORM\Field;

    class ColumnType extends Table {
        protected $sTitle = 'column_types';

        /** @var Field\Id column_type_id **/
        public $column_type_id;

        /** @var Field\TextNullable column_type_name **/
        public $column_type_name;

        /** @var Field\TextNullable column_type_mysql **/
        public $column_type_mysql;

        /** @var Field\TextNullable column_type_php **/
        public $column_type_php;

        /** @var Field\TextNullable column_type_javascript **/
        public $column_type_javascript;

        /** @var Field\Boolean column_type_unsigned **/
        public $column_type_unsigned;

        /** @var Field\Boolean column_type_null **/
        public $column_type_null;

        /** @var Field\Boolean column_type_primary **/
        public $column_type_primary;

        /** @var Field\Boolean column_type_auto_increment **/
        public $column_type_auto_increment;

        /** @var Field\Integer column_type_length **/
        public $column_type_length;


        protected function init() {
            $this->addPrimary(new Field\Id('column_type_id'));

            $this->addFields(
                new Field\TextNullable('column_type_name'),
                new Field\TextNullable('column_type_mysql'),
                new Field\TextNullable('column_type_php'),
                new Field\TextNullable('column_type_javascript'),
                new Field\Boolean('column_type_unsigned'),
                new Field\Boolean('column_type_null'),
                new Field\Boolean('column_type_primary'),
                new Field\Boolean('column_type_auto_increment'),
                new Field\Integer('column_type_length')
            );

        }

        /**
         * @return ColumnTypes
         */
        public static function getTables() {
            return new ColumnTypes;
        }

        /**
         * @param int $iColumnTypeId
         * @return ColumnType
         */
        public static function getById($iColumnTypeId) {
            $oTable = new self;
            return self::getBy(
                $oTable->column_type_id->setValue($iColumnTypeId)
            );
        }

        /**
         * @return bool
         */
        public function isUnsigned() {
            return $this->column_type_unsigned->isTrue();
        }

        /**
         * @return bool
         */
        public function isNull() {
            return $this->column_type_null->isTrue();
        }

        /**
         * @return bool
         */
        public function isPrimary() {
            return $this->column_type_primary->isTrue();
        }

        /**
         * @return bool
         */
        public function isAuto_increment() {
            return $this->column_type_auto_increment->isTrue();
        }
    }