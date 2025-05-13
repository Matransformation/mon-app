/*
  Warnings:

  - Added the required column `cookingTime` to the `Recette` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preparationTime` to the `Recette` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steps` to the `Recette` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Recette` ADD COLUMN `cookingTime` INTEGER NOT NULL,
    ADD COLUMN `photoUrl` VARCHAR(191) NULL,
    ADD COLUMN `preparationTime` INTEGER NOT NULL,
    ADD COLUMN `steps` JSON NOT NULL;
