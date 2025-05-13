-- CreateTable
CREATE TABLE `RecetteAllowedSide` (
    `recetteId` VARCHAR(191) NOT NULL,
    `sideType` ENUM('PROTEIN', 'CARB', 'FAT') NOT NULL,

    PRIMARY KEY (`recetteId`, `sideType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngredientSideType` (
    `ingredientId` VARCHAR(191) NOT NULL,
    `sideType` ENUM('PROTEIN', 'CARB', 'FAT') NOT NULL,

    PRIMARY KEY (`ingredientId`, `sideType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecetteAllowedSide` ADD CONSTRAINT `RecetteAllowedSide_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngredientSideType` ADD CONSTRAINT `IngredientSideType_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;

-- RenameIndex
ALTER TABLE `Favori` RENAME INDEX `Favori_utilisateurId_fkey` TO `Favori_utilisateurId_idx`;

-- RenameIndex
ALTER TABLE `HistoriquePoids` RENAME INDEX `HistoriquePoids_utilisateurId_fkey` TO `HistoriquePoids_utilisateurId_idx`;

-- RenameIndex
ALTER TABLE `Mensurations` RENAME INDEX `Mensurations_utilisateurId_fkey` TO `Mensurations_utilisateurId_idx`;

-- RenameIndex
ALTER TABLE `Session` RENAME INDEX `Session_userId_fkey` TO `Session_userId_idx`;
