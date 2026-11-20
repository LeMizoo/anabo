-- AlterTable
ALTER TABLE `QuoteRequest` ADD COLUMN `acceptedEndDate` DATETIME(3) NULL,
    ADD COLUMN `acceptedStartDate` DATETIME(3) NULL,
    ADD COLUMN `clientAcceptedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `AdminPushSubscription` (
    `id` VARCHAR(30) NOT NULL,
    `adminUserId` VARCHAR(30) NOT NULL,
    `endpointHash` VARCHAR(64) NOT NULL,
    `endpoint` TEXT NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AdminPushSubscription_endpointHash_key`(`endpointHash`),
    INDEX `AdminPushSubscription_adminUserId_idx`(`adminUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
