-- CreateTable
CREATE TABLE `EmptyReturnRule` (
    `id` VARCHAR(30) NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `days` INTEGER NOT NULL,
    `ferryDays` INTEGER NULL,
    `circuitSlugs` TEXT NOT NULL,
    `regionValues` TEXT NOT NULL,
    `keywords` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmptyReturnRule_active_sortOrder_idx`(`active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
