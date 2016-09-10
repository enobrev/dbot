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

        /**
         * @param int|Project $iProjectId
         * @return Tables
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByProject($iProjectId) {
            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->eq($oTable->project_id->setValue($iProjectId));

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

        /**
         * @param Projects|int[] $aProjectIds
         * @return Tables
         * @throws \Enobrev\ORM\DbException
         * @throws \Enobrev\SQLMissingTableOrFieldsException
         */
        public static function getByProjects($aProjectIds) {
            if ($aProjectIds instanceof Projects) {
                $aProjectIds = $aProjectIds->toPrimaryArray();
            }

            $oTable = static::getTable();
            $oSQL = SQLBuilder::select($oTable)->in($oTable->project_id, $aProjectIds);

            $oResults = Db::getInstance()->namedQuery(__METHOD__, $oSQL);
            return self::fromResults($oResults, $oTable);
        }

    }