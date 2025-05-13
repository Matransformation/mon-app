-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `isSubscribed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `trialEndsAt` DATETIME(3) NULL;
