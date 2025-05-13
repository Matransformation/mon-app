-- AddForeignKey
ALTER TABLE `Favori` ADD CONSTRAINT `Favori_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
