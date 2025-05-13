-- CreateTable
CREATE TABLE `Recette` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ingredient` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NULL,
    `unit` VARCHAR(191) NULL,
    `recetteId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ingredient` ADD CONSTRAINT `Ingredient_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
