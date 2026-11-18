-- CreateTable
-- Tarifs journaliers par véhicule (euros), modifiables dans /admin/prix.
CREATE TABLE `VehicleRate` (
    `vehicleType` VARCHAR(20) NOT NULL,
    `dailyRate` INTEGER NOT NULL,
    `modelName` VARCHAR(100) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`vehicleType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Valeurs initiales : 4x4 à 80 €/jour, Mini van à 100 €/jour.
INSERT INTO `VehicleRate` (`vehicleType`, `dailyRate`, `modelName`, `updatedAt`) VALUES
    ('4x4', 80, 'Prado', CURRENT_TIMESTAMP(3)),
    ('minivan', 100, 'Grand Starex', CURRENT_TIMESTAMP(3));
