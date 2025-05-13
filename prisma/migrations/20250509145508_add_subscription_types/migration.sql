-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `hasAccessToFullContent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `subscriptionEnd` DATETIME(3) NULL,
    ADD COLUMN `subscriptionType` VARCHAR(191) NULL;
