-- AlterTable
ALTER TABLE `roadmapitem` ADD COLUMN `academicYear` INTEGER NULL,
    ADD COLUMN `resources` JSON NULL;

-- AlterTable
ALTER TABLE `task` ADD COLUMN `resources` JSON NULL;
