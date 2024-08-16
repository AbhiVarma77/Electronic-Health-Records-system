/*
  Warnings:

  - The `height` column on the `Visit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "height",
ADD COLUMN     "height" INTEGER;
