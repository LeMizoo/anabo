CREATE TABLE `PricingConfig` (
  `id` VARCHAR(30) NOT NULL,
  `circuitSlug` VARCHAR(191) NOT NULL,
  `basePrice` INTEGER NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
  `updatedAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `PricingConfig_circuitSlug_key` (`circuitSlug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PricingVehicle` (
  `id` VARCHAR(30) NOT NULL,
  `configId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `capacity` INTEGER NOT NULL,
  `pricePerDay` INTEGER NOT NULL DEFAULT 0,
  `indicativeOnly` BOOLEAN NOT NULL DEFAULT false,
  UNIQUE INDEX `PricingVehicle_configId_name_key` (`configId`, `name`),
  INDEX `PricingVehicle_configId_idx` (`configId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `PricingVehicle_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `PricingConfig` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PricingRule` (
  `id` VARCHAR(30) NOT NULL,
  `kind` VARCHAR(20) NOT NULL,
  `threshold` INTEGER NOT NULL,
  `percentage` INTEGER NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `PricingRule_kind_threshold_key` (`kind`, `threshold`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
