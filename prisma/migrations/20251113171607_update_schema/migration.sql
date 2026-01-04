/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FoodItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FoodItems` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `typeId` column on the `FoodItems` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Images` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Ingrediants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Ingrediants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MadeWith` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MadeWith` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `foodItemId` on the `Images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `foodItemId` on the `MadeWith` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ingredientId` on the `MadeWith` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `foodItemId` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "FoodItems" DROP CONSTRAINT "FoodItems_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Images" DROP CONSTRAINT "Images_foodItemId_fkey";

-- DropForeignKey
ALTER TABLE "MadeWith" DROP CONSTRAINT "MadeWith_foodItemId_fkey";

-- DropForeignKey
ALTER TABLE "MadeWith" DROP CONSTRAINT "MadeWith_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_foodItemId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FoodItems" DROP CONSTRAINT "FoodItems_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "typeId",
ADD COLUMN     "typeId" INTEGER,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "FoodItems_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Images" DROP CONSTRAINT "Images_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "foodItemId",
ADD COLUMN     "foodItemId" INTEGER NOT NULL,
ADD CONSTRAINT "Images_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Ingrediants" DROP CONSTRAINT "Ingrediants_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "Ingrediants_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MadeWith" DROP CONSTRAINT "MadeWith_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "foodItemId",
ADD COLUMN     "foodItemId" INTEGER NOT NULL,
DROP COLUMN "ingredientId",
ADD COLUMN     "ingredientId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "MadeWith_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "foodItemId",
ADD COLUMN     "foodItemId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Types" DROP CONSTRAINT "Types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "Types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "MadeWith_foodItemId_ingredientId_key" ON "MadeWith"("foodItemId", "ingredientId");

-- AddForeignKey
ALTER TABLE "FoodItems" ADD CONSTRAINT "FoodItems_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MadeWith" ADD CONSTRAINT "MadeWith_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MadeWith" ADD CONSTRAINT "MadeWith_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingrediants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
