-- AlterTable
ALTER TABLE "User" ADD COLUMN "supabaseUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- DropTable
DROP TABLE IF EXISTS "Account";

-- DropTable
DROP TABLE IF EXISTS "Session";

-- DropTable
DROP TABLE IF EXISTS "VerificationToken";
