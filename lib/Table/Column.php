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

        /** @var Field\Id column_id **/
        public $column_id;

        /** @var Field\Integer table_id **/
        public $table_id;

        /** @var Field\Integer reference_column_id **/
        public $reference_column_id;

        /** @var Field\Enum reference_delete **/
        public $reference_delete;

        /** @var Field\Enum reference_update **/
        public $reference_update;

        /** @var Field\TextNullable column_name **/
        public $column_name;

        /** @var Field\TextNullable column_name_singular **/
        public $column_name_singular;

        /** @var Field\TextNullable column_name_plural **/
        public $column_name_plural;

        /** @var Field\TextNullable column_name_short **/
        public $column_name_short;

        /** @var Field\TextNullable column_display_singular **/
        public $column_display_singular;

        /** @var Field\TextNullable column_display_plural **/
        public $column_display_plural;

        /** @var Field\Integer column_type_id **/
        public $column_type_id;

        /** @var Field\Integer column_length **/
        public $column_length;

        /** @var Field\TextNullable column_values **/
        public $column_values;

        /** @var Field\TextNullable column_default **/
        public $column_default;

        /** @var Field\Boolean column_null **/
        public $column_null;

        /** @var Field\Boolean column_primary **/
        public $column_primary;

        /** @var Field\Boolean column_unique **/
        public $column_unique;

        /** @var Field\Boolean column_auto_increment **/
        public $column_auto_increment;

        /** @var Field\DateTime column_date_added **/
        public $column_date_added;

        /** @var Field\DateTime column_date_updated **/
        public $column_date_updated;


        protected function init() {
            $this->addPrimary(new Field\Id('column_id'));

            $this->addFields(
                new Field\Integer('table_id'),
                new Field\Integer('reference_column_id'),
                new Field\Enum('reference_delete', [self::DELETE_CASCADE, self::DELETE_SET_NULL, self::DELETE_NO_ACTION, self::DELETE_RESTRICT]),
                new Field\Enum('reference_update', [self::UPDATE_CASCADE, self::UPDATE_SET_NULL, self::UPDATE_NO_ACTION, self::UPDATE_RESTRICT]),
                new Field\TextNullable('column_name'),
                new Field\TextNullable('column_name_singular'),
                new Field\TextNullable('column_name_plural'),
                new Field\TextNullable('column_name_short'),
                new Field\TextNullable('column_display_singular'),
                new Field\TextNullable('column_display_plural'),
                new Field\Integer('column_type_id'),
                new Field\Integer('column_length'),
                new Field\TextNullable('column_values'),
                new Field\TextNullable('column_default'),
                new Field\Boolean('column_null'),
                new Field\Boolean('column_primary'),
                new Field\Boolean('column_unique'),
                new Field\Boolean('column_auto_increment'),
                new Field\DateTime('column_date_added'),
                new Field\DateTime('column_date_updated')
            );

            $this->reference_delete->setDefault(self::DELETE_CASCADE);
            $this->reference_update->setDefault(self::UPDATE_CASCADE);

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
         * @param int $iColumnId
         * @return Column
         */
        public static function getById($iColumnId) {
            $oTable = new self;
            return self::getBy(
                $oTable->column_id->setValue($iColumnId)
            );
        }

        /**
         * @return bool
         */
        public function isNull() {
            return $this->column_null->isTrue();
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
            $this->column_date_added->setValue($this->now());
            $this->column_date_updated->setValue($this->now());
        }

        public function preUpsert() {
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