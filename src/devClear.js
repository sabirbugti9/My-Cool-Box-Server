// devClear.js
import { prisma } from './server.js';

async function clearConversationsAndMessages() {
    try {
        // Delete children first (respect FK constraints)
        await prisma.orderAccessory.deleteMany();
        await prisma.orderFruit.deleteMany();
        await prisma.orderBeverage.deleteMany();
        await prisma.payment.deleteMany();

        // Now safe to delete parent
        await prisma.order.deleteMany();
        await prisma.staticContent.deleteMany();


        console.log("@ Cleared all orders and related data");
    } catch (err) {
        console.error("X Error clearing:", err);
    } finally {
        await prisma.$disconnect();
    }
}

clearConversationsAndMessages();
