-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_couponId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderAccessory` DROP FOREIGN KEY `OrderAccessory_accessoryId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderAccessory` DROP FOREIGN KEY `OrderAccessory_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderBeverage` DROP FOREIGN KEY `OrderBeverage_beverageId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderBeverage` DROP FOREIGN KEY `OrderBeverage_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderFruit` DROP FOREIGN KEY `OrderFruit_fruitId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderFruit` DROP FOREIGN KEY `OrderFruit_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropIndex
DROP INDEX `Order_couponId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `Order`;

-- DropIndex
DROP INDEX `OrderAccessory_accessoryId_fkey` ON `OrderAccessory`;

-- DropIndex
DROP INDEX `OrderAccessory_orderId_fkey` ON `OrderAccessory`;

-- DropIndex
DROP INDEX `OrderBeverage_beverageId_fkey` ON `OrderBeverage`;

-- DropIndex
DROP INDEX `OrderBeverage_orderId_fkey` ON `OrderBeverage`;

-- DropIndex
DROP INDEX `OrderFruit_fruitId_fkey` ON `OrderFruit`;

-- DropIndex
DROP INDEX `OrderFruit_orderId_fkey` ON `OrderFruit`;

-- DropIndex
DROP INDEX `Payment_orderId_fkey` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_userId_fkey` ON `Payment`;
