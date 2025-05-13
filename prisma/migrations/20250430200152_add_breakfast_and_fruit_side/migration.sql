/*
  Warnings:

  - The primary key for the `IngredientSideType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RecetteAllowedSide` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `IngredientSideType` DROP PRIMARY KEY,
    MODIFY `sideType` ENUM('PROTEIN', 'BREAKFAST_PROTEIN', 'FRUIT_SIDE', 'CARB', 'FAT', 'DAIRY', 'CEREAL') NOT NULL,
    ADD PRIMARY KEY (`ingredientId`, `sideType`);

-- AlterTable
ALTER TABLE `RecetteAllowedSide` DROP PRIMARY KEY,
    MODIFY `sideType` ENUM('PROTEIN', 'BREAKFAST_PROTEIN', 'FRUIT_SIDE', 'CARB', 'FAT', 'DAIRY', 'CEREAL') NOT NULL,
    ADD PRIMARY KEY (`recetteId`, `sideType`);
