-- CreateTable
CREATE TABLE `MenuJournalier` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `repasType` VARCHAR(191) NOT NULL,
    `recetteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MenuJournalier_userId_idx`(`userId`),
    INDEX `MenuJournalier_recetteId_idx`(`recetteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MenuJournalier` ADD CONSTRAINT `MenuJournalier_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuJournalier` ADD CONSTRAINT `MenuJournalier_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
