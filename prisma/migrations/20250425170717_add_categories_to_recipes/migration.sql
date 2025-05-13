/*
  Warnings:

  - You are about to drop the `_CategoryRecettes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `_CategoryRecettes` DROP FOREIGN KEY `_CategoryRecettes_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoryRecettes` DROP FOREIGN KEY `_CategoryRecettes_B_fkey`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `_CategoryRecettes`;

-- CreateTable
CREATE TABLE `RecetteCategory` (
    `id` VARCHAR(191) NOT NULL,
    `recetteId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RecetteCategory_recetteId_categoryId_key`(`recetteId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Category_name_key` ON `Category`(`name`);

-- AddForeignKey
ALTER TABLE `RecetteCategory` ADD CONSTRAINT `RecetteCategory_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetteCategory` ADD CONSTRAINT `RecetteCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
