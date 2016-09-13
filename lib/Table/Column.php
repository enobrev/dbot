<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;
    use Enobrev\ORM\ModifiedDateColumn;
    use Enobrev\ORM\ModifiedDate;

    class Column extends ORM\Table implements ModifiedDateColumn {
        use ModifiedDate;

        protected $sTitle = 'columns';

        const DELETE_CASCADE   = 'CASCADE';
        const DELETE_SET_NULL  = 'SET NULL';
        const DELETE_NO_ACTION = 'NO ACTION';
        const DELETE_RESTRICT  = 'RESTRICT';

        const UPDATE_CASCADE   = 'CASCADE';
        const UPDATE_SET_NULL  = 'SET NULL';
        const UPDATE_NO_ACTION = 'NO ACTION';
        const UPDATE_RESTRICT  = 'RESTRICT';

        /** @var Field\UUID column_id **/
        public $column_id;

        /** @var Field\UUIDNullable table_id **/
        public $table_id;

        /** @var Field\UUIDNullable reference_column_id **/
        public $reference_column_id;

        /** @var Field\Enum reference_delete **/
        public $reference_delete;

        /** @var Field\Enum reference_update **/
        public $reference_update;

        /** @var Field\Text column_name **/
        public $column_name;

        /** @var Field\Text column_name_singular **/
        public $column_name_singular;

        /** @var Field\Text column_name_plural **/
        public $column_name_plural;

        /** @var Field\Text column_name_short **/
        public $column_name_short;

        /** @var Field\Text column_display_singular **/
        public $column_display_singular;

        /** @var Field\Text column_display_plural **/
        public $column_display_plural;

        /** @var Field\UUIDNullable column_type_id **/
        public $column_type_id;

        /** @var Field\Integer column_length **/
        public $column_length;

        /** @var Field\TextNullable column_values **/
        public $column_values;

        /** @var Field\TextNullable column_default **/
        public $column_default;

        /** @var Field\Boolean column_nullable **/
        public $column_nullable;

        /** @var Field\Boolean column_primary **/
        public $column_primary;

        /** @var Field\Boolean column_unique **/
        public $column_unique;

        /** @var Field\Boolean column_auto_increment **/
        public $column_auto_increment;

        /** @var Field\Boolean column_unsigned **/
        public $column_unsigned;

        /** @var Field\DateTime column_date_added **/
        public $column_date_added;

        /** @var Field\DateTime column_date_updated **/
        public $column_date_updated;


        protected function init() {
            $this->addPrimary(new Field\UUID('column_id'));

            $this->addFields(
                new Field\UUIDNullable('table_id'),
                new Field\UUIDNullable('reference_column_id'),
                new Field\Enum('reference_delete', [self::DELETE_CASCADE, self::DELETE_SET_NULL, self::DELETE_NO_ACTION, self::DELETE_RESTRICT]),
                new Field\Enum('reference_update', [self::UPDATE_CASCADE, self::UPDATE_SET_NULL, self::UPDATE_NO_ACTION, self::UPDATE_RESTRICT]),
                new Field\Text('column_name'),
                new Field\Text('column_name_singular'),
                new Field\Text('column_name_plural'),
                new Field\Text('column_name_short'),
                new Field\Text('column_display_singular'),
                new Field\Text('column_display_plural'),
                new Field\UUIDNullable('column_type_id'),
                new Field\Integer('column_length'),
                new Field\TextNullable('column_values'),
                new Field\TextNullable('column_default'),
                new Field\Boolean('column_nullable'),
                new Field\Boolean('column_primary'),
                new Field\Boolean('column_unique'),
                new Field\Boolean('column_auto_increment'),
                new Field\Boolean('column_unsigned'),
                new Field\DateTime('column_date_added'),
                new Field\DateTime('column_date_updated')
            );

            $this->reference_delete->setDefault(self::DELETE_CASCADE);
            $this->reference_update->setDefault(self::UPDATE_CASCADE);
            $this->column_nullable->setDefault(1);
            $this->column_primary->setDefault(0);
            $this->column_unique->setDefault(0);
            $this->column_auto_increment->setDefault(0);
            $this->column_unsigned->setDefault(0);

            $this->table_id->references('tables', 'table_id');
            $this->reference_column_id->references('columns', 'column_id');
            $this->column_type_id->references('column_types', 'column_type_id');
        }

        /**
         * @return Columns
         */
        public static function getTables() {
            return new Columns;
        }

        /**
         * @param string $sColumnId
         * @return Column
         */
        public static function getById($sColumnId) {
            $oTable = new self;
            return self::getBy(
                $oTable->column_id->setValue($sColumnId)
            );
        }

        /**
         * @return bool
         */
        public function isNullable() {
            return $this->column_nullable->isTrue();
        }

        /**
         * @return bool
         */
        public function isPrimary() {
            return $this->column_primary->isTrue();
        }

        /**
         * @return bool
         */
        public function isUnique() {
            return $this->column_unique->isTrue();
        }

        /**
         * @return bool
         */
        public function isAuto_increment() {
            return $this->column_auto_increment->isTrue();
        }

        /**
         * @return bool
         */
        public function isUnsigned() {
            return $this->column_unsigned->isTrue();
        }

        /**
         * @return Table
         */
        public function getTable() {
            if ($this->table_id->hasValue()) {
                return Table::getById($this->table_id->getValue());
            }
        }

        /**
         * @param Table|null $oTable
         * @return bool
         */
        public function hasTable(Table $oTable = null) {
            return $oTable instanceof Table
                && $this->table_id->is($oTable);
        }

        /**
         * @return Column
         */
        public function getReferenceColumn() {
            if ($this->reference_column_id->hasValue()) {
                return Column::getById($this->reference_column_id->getValue());
            }
        }

        /**
         * @param Column|null $oReferenceColumn
         * @return bool
         */
        public function hasReferenceColumn(Column $oReferenceColumn = null) {
            return $oReferenceColumn instanceof Column
                && $this->reference_column_id->is($oReferenceColumn);
        }

        /**
         * @return ColumnType
         */
        public function getColumnType() {
            if ($this->column_type_id->hasValue()) {
                return ColumnType::getById($this->column_type_id->getValue());
            }
        }

        /**
         * @param ColumnType|null $oColumnType
         * @return bool
         */
        public function hasColumnType(ColumnType $oColumnType = null) {
            return $oColumnType instanceof ColumnType
                && $this->column_type_id->is($oColumnType);
        }

        public function preInsert() {
            if ($this->column_id->isNull()) {
                $this->column_id->generateValue();
            }
            $this->column_date_added->setValue($this->now());
            $this->column_date_updated->setValue($this->now());
        }

        public function preUpsert() {
            if ($this->column_id->isNull()) {
                $this->column_id->generateValue();
            }
            $this->column_date_added->setValue($this->now());
            $this->column_date_updated->setValue($this->now());
        }

        public function preUpdate() {
            $this->column_date_updated->setValue($this->now());
        }

        public function getModifiedDateField() {
            return $this->column_date_updated;
        }
    }