-- CreateTable
CREATE TABLE "report_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportTheme" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "uploadedFileName" TEXT,
    "generatedContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_histories_userId_createdAt_idx" ON "report_histories"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "report_histories" ADD CONSTRAINT "report_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
