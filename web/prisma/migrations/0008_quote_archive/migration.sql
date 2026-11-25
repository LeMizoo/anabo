-- AlterTable
ALTER TABLE `QuoteRequest` ADD COLUMN `archivedAt` DATETIME(3) NULL,
    ADD COLUMN `archivedBy` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `QuoteRequest_archivedAt_idx` ON `QuoteRequest`(`archivedAt`);
