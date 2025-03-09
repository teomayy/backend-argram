/*
  Warnings:

  - You are about to drop the column `messageId` on the `message_attachment` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `message_reaction` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `message_reaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `message_reaction` table. All the data in the column will be lost.
  - You are about to drop the column `totalSeconds` on the `pomodoro_round` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[message_id,user_id]` on the table `message_reaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message_id` to the `message_attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_id` to the `message_reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `message_reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_seconds` to the `pomodoro_round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "message_attachment" DROP CONSTRAINT "message_attachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "message_reaction" DROP CONSTRAINT "message_reaction_chatId_fkey";

-- DropForeignKey
ALTER TABLE "message_reaction" DROP CONSTRAINT "message_reaction_messageId_fkey";

-- DropForeignKey
ALTER TABLE "message_reaction" DROP CONSTRAINT "message_reaction_userId_fkey";

-- DropIndex
DROP INDEX "message_reaction_messageId_userId_key";

-- AlterTable
ALTER TABLE "message_attachment" DROP COLUMN "messageId",
ADD COLUMN     "message_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "message_reaction" DROP COLUMN "chatId",
DROP COLUMN "messageId",
DROP COLUMN "userId",
ADD COLUMN     "chat_id" TEXT,
ADD COLUMN     "message_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pomodoro_round" DROP COLUMN "totalSeconds",
ADD COLUMN     "total_seconds" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "message_reaction_message_id_user_id_key" ON "message_reaction"("message_id", "user_id");

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reaction" ADD CONSTRAINT "message_reaction_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reaction" ADD CONSTRAINT "message_reaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reaction" ADD CONSTRAINT "message_reaction_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
