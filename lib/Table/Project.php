<?php
    namespace DBot\Table;

    use Enobrev\ORM;
    use Enobrev\ORM\Field;

    class Project extends ORM\Table {
        protected $sTitle = 'projects';

        /** @var Field\UUID project_id **/
        public $project_id;

        /** @var Field\TextNullable project_name **/
        public $project_name;


        protected function init() {
            $this->addPrimary(new Field\UUID('project_id'));

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
         * @param string $sProjectId
         * @return Project
         */
        public static function getById($sProjectId) {
            $oTable = new self;
            return self::getBy(
                $oTable->project_id->setValue($sProjectId)
            );
        }
    }