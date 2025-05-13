/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Recette` MODIFY `carbs` INTEGER NULL,
    MODIFY `fat` INTEGER NULL;

-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `stripeCurrentPeriodEnd` DATETIME(3) NULL,
    ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `stripePriceId` VARCHAR(191) NULL,
    ADD COLUMN `stripeStatus` VARCHAR(191) NULL,
    ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Utilisateur_stripeCustomerId_key` ON `Utilisateur`(`stripeCustomerId`);
