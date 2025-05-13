/*
  Warnings:

  - You are about to alter the column `objectifPoids` on the `Utilisateur` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Recette` MODIFY `carbs` INTEGER NULL;

-- AlterTable
ALTER TABLE `RepasJournalier` MODIFY `fat` INTEGER NULL,
    MODIFY `carbs` INTEGER NULL;

-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `birthdate` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    MODIFY `objectifPoids` VARCHAR(191) NULL;
