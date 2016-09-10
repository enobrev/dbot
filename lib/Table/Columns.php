<?php
    namespace DBot\Table;

    use DateTime;

    use Enobrev\ORM\Db;
    use Enobrev\ORM;
    use Enobrev\SQLBuilder;

    class Columns extends ORM\Tables {
        /**
         * @return Column
         */
        public static function getTable() {
            return new Column;
        }

        /**
         * @param int|Table $iTableId
         * @return Columns
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
         * @return Columns
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
         * @return Columns
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByReferenceColumn($iColumnId) {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->eq($oTable->reference_column_id->setValue($iColumnId));

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param Columns|int[] $aColumnIds
         * @return Columns
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByReferenceColumns($aColumnIds) {
            if ($aColumnIds instanceof Columns) {
                $aColumnIds = $aColumnIds->toPrimaryArray();
            }

            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->in($oTable->reference_column_id, $aColumnIds);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param int|ColumnType $iColumnTypeId
         * @return Columns
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByColumnType($iColumnTypeId) {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->eq($oTable->column_type_id->setValue($iColumnTypeId));

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param ColumnTypes|int[] $aColumnTypeIds
         * @return Columns
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByColumnTypes($aColumnTypeIds) {
            if ($aColumnTypeIds instanceof ColumnTypes) {
                $aColumnTypeIds = $aColumnTypeIds->toPrimaryArray();
            }

            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->in($oTable->column_type_id, $aColumnTypeIds);

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
            $oSQL->field($oTable->column_date_updated);
            $oSQL->desc($oTable->column_date_updated);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return new DateTime($oResults->fetchObject()->column_date_updated);
        }
    }