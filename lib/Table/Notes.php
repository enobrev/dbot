<?php
    namespace DBot\Table;

    use DateTime;

    use Enobrev\ORM\Db;
    use Enobrev\ORM\Tables;
    use Enobrev\SQLBuilder;

    class Notes extends Tables {
        /**
         * @return Note
         */
        public static function getTable() {
            return new Note;
        }

        /**
         * @param int|Table $iTableId
         * @return Notes
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByTable($iTableId) {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->eq($oTable->table_id->setValue($iTableId));

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param Tables|int[] $aTableIds
         * @return Notes
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByTables($aTableIds) {
            if ($aTableIds instanceof Tables) {
                $aTableIds = $aTableIds->toPrimaryArray();
            }

            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->in($oTable->table_id, $aTableIds);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param int|Column $iColumnId
         * @return Notes
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByColumn($iColumnId) {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->eq($oTable->column_id->setValue($iColumnId));

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param Columns|int[] $aColumnIds
         * @return Notes
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByColumns($aColumnIds) {
            if ($aColumnIds instanceof Columns) {
                $aColumnIds = $aColumnIds->toPrimaryArray();
            }

            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->in($oTable->column_id, $aColumnIds);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }


        /**
         * @return DateTime
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getMostRecentUpdatedDate() {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->limit(1);
            $oSQL->field($oTable->note_date_updated);
            $oSQL->desc($oTable->note_date_updated);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return new DateTime($oResults->fetchObject()->note_date_updated);
        }
    }