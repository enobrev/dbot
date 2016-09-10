<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;

    class Project extends ORM\Table {
        protected $sTitle = 'projects';

        /** @var Field\Id project_id **/
        public $project_id;

        /** @var Field\TextNullable project_name **/
        public $project_name;


        protected function init() {
            $this->addPrimary(new Field\Id('project_id'));

            $this->addFields(
                new Field\TextNullable('project_name')
            );

        }

        /**
         * @return Projects
         */
        public static function getTables() {
            return new Projects;
        }

        /**
         * @param int $iProjectId
         * @return Project
         */
        public static function getById($iProjectId) {
            $oTable = new self;
            return self::getBy(
                $oTable->project_id->setValue($iProjectId)
            );
        }
    }