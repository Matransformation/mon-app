/*
  Warnings:

  - You are about to drop the column `accompagnements` on the `MenuJournalier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MenuJournalier` DROP COLUMN `accompagnements`;

-- CreateTable
CREATE TABLE `Accompagnement` (
    `id` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `Accompagnement_menuId_ingredientId_key`(`menuId`, `ingredientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Accompagnement` ADD CONSTRAINT `Accompagnement_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `MenuJournalier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accompagnement` ADD CONSTRAINT `Accompagnement_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
