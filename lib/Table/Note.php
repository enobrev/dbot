<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;
    use Enobrev\ORM\ModifiedDateColumn;
    use Enobrev\ORM\ModifiedDate;

    class Note extends ORM\Table implements ModifiedDateColumn {
        use ModifiedDate;

        protected $sTitle = 'notes';

        /** @var Field\UUID note_id **/
        public $note_id;

        /** @var Field\UUIDNullable table_id **/
        public $table_id;

        /** @var Field\UUIDNullable column_id **/
        public $column_id;

        /** @var Field\TextNullable note_text **/
        public $note_text;

        /** @var Field\DateTime note_date_added **/
        public $note_date_added;

        /** @var Field\DateTime note_date_updated **/
        public $note_date_updated;


        protected function init() {
            $this->addPrimary(new Field\UUID('note_id'));

            $this->addFields(
                new Field\UUIDNullable('table_id'),
                new Field\UUIDNullable('column_id'),
                new Field\TextNullable('note_text'),
                new Field\DateTime('note_date_added'),
                new Field\DateTime('note_date_updated')
            );


            $this->table_id->references('tables', 'table_id');
            $this->column_id->references('columns', 'column_id');
        }

        /**
         * @return Notes
         */
        public static function getTables() {
            return new Notes;
        }

        /**
         * @param string $sNoteId
         * @return Note
         */
        public static function getById($sNoteId) {
            $oTable = new self;
            return self::getBy(
                $oTable->note_id->setValue($sNoteId)
            );
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
        public function getColumn() {
            if ($this->column_id->hasValue()) {
                return Column::getById($this->column_id->getValue());
            }
        }

        /**
         * @param Column|null $oColumn
         * @return bool
         */
        public function hasColumn(Column $oColumn = null) {
            return $oColumn instanceof Column
                && $this->column_id->is($oColumn);
        }

        public function preInsert() {
            if ($this->note_id->isNull()) {
                $this->note_id->generateValue();
            }
            $this->note_date_added->setValue($this->now());
            $this->note_date_updated->setValue($this->now());
        }

        public function preUpsert() {
            if ($this->note_id->isNull()) {
                $this->note_id->generateValue();
            }
            $this->note_date_added->setValue($this->now());
            $this->note_date_updated->setValue($this->now());
        }

        public function preUpdate() {
            $this->note_date_updated->setValue($this->now());
        }

        public function getModifiedDateField() {
            return $this->note_date_updated;
        }
    }