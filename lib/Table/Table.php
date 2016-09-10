<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;

    class Table extends ORM\Table {
        protected $sTitle = 'tables';

        /** @var Field\Id table_id **/
        public $table_id;

        /** @var Field\Integer project_id **/
        public $project_id;

        /** @var Field\TextNullable table_name **/
        public $table_name;

        /** @var Field\TextNullable table_name_singular **/
        public $table_name_singular;

        /** @var Field\TextNullable table_name_plural **/
        public $table_name_plural;

        /** @var Field\TextNullable table_display_singular **/
        public $table_display_singular;

        /** @var Field\TextNullable table_display_plural **/
        public $table_display_plural;

        /** @var Field\TextNullable table_class_singular **/
        public $table_class_singular;

        /** @var Field\TextNullable table_class_plural **/
        public $table_class_plural;


        protected function init() {
            $this->addPrimary(new Field\Id('table_id'));

            $this->addFields(
                new Field\Integer('project_id'),
                new Field\TextNullable('table_name'),
                new Field\TextNullable('table_name_singular'),
                new Field\TextNullable('table_name_plural'),
                new Field\TextNullable('table_display_singular'),
                new Field\TextNullable('table_display_plural'),
                new Field\TextNullable('table_class_singular'),
                new Field\TextNullable('table_class_plural')
            );


            $this->project_id->references('projects', 'project_id');
        }

        /**
         * @return Tables
         */
        public static function getTables() {
            return new Tables;
        }

        /**
         * @param int $iTableId
         * @return Table
         */
        public static function getById($iTableId) {
            $oTable = new self;
            return self::getBy(
                $oTable->table_id->setValue($iTableId)
            );
        }

        /**
         * @return Project
         */
        public function getProject() {
            if ($this->project_id->hasValue()) {
                return Project::getById($this->project_id->getValue());
            }
        }

        /**
         * @param Project|null $oProject
         * @return bool
         */
        public function hasProject(Project $oProject = null) {
            return $oProject instanceof Project
                && $this->project_id->is($oProject);
        }
    }