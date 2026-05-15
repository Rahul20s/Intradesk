-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploadedBy_fkey";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "uploadedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
