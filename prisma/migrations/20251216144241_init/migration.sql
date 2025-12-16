-- DropForeignKey
ALTER TABLE "purchase_transactions" DROP CONSTRAINT "purchase_transactions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "sales_transactions" DROP CONSTRAINT "sales_transactions_created_by_fkey";

-- AlterTable
ALTER TABLE "purchase_transactions" ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales_transactions" ALTER COLUMN "created_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sales_transactions" ADD CONSTRAINT "sales_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
