/*
  Warnings:

  - A unique constraint covering the columns `[qrId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "qrId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_qrId_key" ON "Patient"("qrId");
