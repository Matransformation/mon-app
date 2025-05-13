-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoryRecettes` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CategoryRecettes_AB_unique`(`A`, `B`),
    INDEX `_CategoryRecettes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CategoryRecettes` ADD CONSTRAINT `_CategoryRecettes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoryRecettes` ADD CONSTRAINT `_CategoryRecettes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Recette`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
