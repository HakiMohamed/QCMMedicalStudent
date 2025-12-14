-- CreateEnum
CREATE TYPE "UnlockRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "semester_accesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "accessType" "AccessType" NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unlock_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "paymentProof" TEXT NOT NULL,
    "status" "UnlockRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unlock_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "semester_accesses_userId_idx" ON "semester_accesses"("userId");

-- CreateIndex
CREATE INDEX "semester_accesses_semesterId_idx" ON "semester_accesses"("semesterId");

-- CreateIndex
CREATE INDEX "semester_accesses_expiryDate_idx" ON "semester_accesses"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "semester_accesses_userId_semesterId_key" ON "semester_accesses"("userId", "semesterId");

-- CreateIndex
CREATE INDEX "unlock_requests_userId_idx" ON "unlock_requests"("userId");

-- CreateIndex
CREATE INDEX "unlock_requests_semesterId_idx" ON "unlock_requests"("semesterId");

-- CreateIndex
CREATE INDEX "unlock_requests_status_idx" ON "unlock_requests"("status");

-- CreateIndex
CREATE INDEX "unlock_requests_createdAt_idx" ON "unlock_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "semester_accesses" ADD CONSTRAINT "semester_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_accesses" ADD CONSTRAINT "semester_accesses_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_requests" ADD CONSTRAINT "unlock_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_requests" ADD CONSTRAINT "unlock_requests_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
