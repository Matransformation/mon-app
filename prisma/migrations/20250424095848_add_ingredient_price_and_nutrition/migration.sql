/*
  Warnings:

  - Added the required column `calories` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbs` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protein` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `Ingredient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unit` on table `Ingredient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Ingredient` ADD COLUMN `calories` INTEGER NOT NULL,
    ADD COLUMN `carbs` INTEGER NOT NULL,
    ADD COLUMN `fat` INTEGER NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `protein` INTEGER NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL,
    MODIFY `unit` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Recette` ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `timeCook` INTEGER NULL,
    ADD COLUMN `timePrep` INTEGER NULL;
