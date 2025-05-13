/*
  Warnings:

  - You are about to drop the column `quantity` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `recetteId` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Ingredient` DROP FOREIGN KEY `Ingredient_recetteId_fkey`;

-- DropIndex
DROP INDEX `Ingredient_recetteId_fkey` ON `Ingredient`;

-- AlterTable
ALTER TABLE `Ingredient` DROP COLUMN `quantity`,
    DROP COLUMN `recetteId`,
    DROP COLUMN `unit`;

-- CreateTable
CREATE TABLE `RecetteIngredient` (
    `id` VARCHAR(191) NOT NULL,
    `recetteId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RecetteIngredient_recetteId_ingredientId_key`(`recetteId`, `ingredientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecetteIngredient` ADD CONSTRAINT `RecetteIngredient_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetteIngredient` ADD CONSTRAINT `RecetteIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
