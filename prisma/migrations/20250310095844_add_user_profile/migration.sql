-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'Hey there! I''m using ArGram',
ALTER COLUMN "password" SET DEFAULT '';
