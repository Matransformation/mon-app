-- DropForeignKey
ALTER TABLE `MenuJournalier` DROP FOREIGN KEY `MenuJournalier_recetteId_fkey`;

-- AlterTable
ALTER TABLE `MenuJournalier` MODIFY `recetteId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MenuJournalier` ADD CONSTRAINT `MenuJournalier_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
