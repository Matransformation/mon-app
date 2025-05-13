/*
  Warnings:

  - You are about to drop the column `imc` on the `Mensurations` table. All the data in the column will be lost.
  - You are about to drop the column `poids` on the `Mensurations` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropIndex
DROP INDEX `Account_userId_fkey` ON `Account`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `Session`;

-- AlterTable
ALTER TABLE `Mensurations` DROP COLUMN `imc`,
    DROP COLUMN `poids`;

-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `User`;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
