/*
  Warnings:

  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeacherClasses` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachername` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherClasses" DROP CONSTRAINT "_TeacherClasses_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherClasses" DROP CONSTRAINT "_TeacherClasses_B_fkey";

-- DropIndex
DROP INDEX "public"."Subject_code_idx";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "adminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "teachername" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImage" TEXT NOT NULL DEFAULT 'default.png',
ALTER COLUMN "role" SET DEFAULT 'User';

-- DropTable
DROP TABLE "public"."Teacher";

-- DropTable
DROP TABLE "public"."_TeacherClasses";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_classId_idx" ON "Admin"("classId");

-- CreateIndex
CREATE INDEX "Subject_name_idx" ON "Subject"("name");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
