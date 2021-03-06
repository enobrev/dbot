<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;

    class ColumnType extends ORM\Table {
        protected $sTitle = 'column_types';

        /** @var Field\UUID column_type_id **/
        public $column_type_id;

        /** @var Field\TextNullable column_type_name **/
        public $column_type_name;

        /** @var Field\TextNullable column_type_php **/
        public $column_type_php;

        /** @var Field\TextNullable column_type_mysql **/
        public $column_type_mysql;

        /** @var Field\Integer column_type_length **/
        public $column_type_length;

        /** @var Field\Boolean column_type_unsigned **/
        public $column_type_unsigned;

        /** @var Field\Boolean column_type_nullable **/
        public $column_type_nullable;


        protected function init() {
            $this->addPrimary(new Field\UUID('column_type_id'));

            $this->addFields(
                new Field\TextNullable('column_type_name'),
                new Field\TextNullable('column_type_php'),
                new Field\TextNullable('column_type_mysql'),
                new Field\Integer('column_type_length'),
                new Field\Boolean('column_type_unsigned'),
                new Field\Boolean('column_type_nullable')
            );

            $this->column_type_unsigned->setDefault(0);
            $this->column_type_nullable->setDefault(0);
        }

        /**
         * @return ColumnTypes
         */
        public static function getTables() {
            return new ColumnTypes;
        }

        /**
         * @param string $sColumnTypeId
         * @return ColumnType
         */
        public static function getById($sColumnTypeId) {
            $oTable = new self;
            return self::getBy(
                $oTable->column_type_id->setValue($sColumnTypeId)
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
        public function isNullable() {
            return $this->column_type_nullable->isTrue();
        }
    }