-- CreateTable
CREATE TABLE `QuoteRequest` (
    `id` VARCHAR(30) NOT NULL,
    `reference` VARCHAR(32) NOT NULL,
    `status` ENUM('NOUVEAU', 'CONTACTE', 'DEVIS_ENVOYE', 'CONFIRME', 'PERDU') NOT NULL DEFAULT 'NOUVEAU',
    `locale` VARCHAR(2) NOT NULL DEFAULT 'fr',
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `country` VARCHAR(100) NULL,
    `circuitSlug` VARCHAR(191) NULL,
    `circuitTitle` VARCHAR(191) NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `adults` INTEGER NOT NULL DEFAULT 2,
    `children` INTEGER NOT NULL DEFAULT 0,
    `message` TEXT NULL,
    `adminNotes` TEXT NULL,
    `contactedAt` DATETIME(3) NULL,
    `quoteSentAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `lostAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QuoteRequest_reference_key`(`reference`),
    INDEX `QuoteRequest_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `QuoteRequest_email_idx`(`email`),
    INDEX `QuoteRequest_circuitSlug_idx`(`circuitSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'ADMIN',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
