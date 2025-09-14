
import { prisma } from "../server.js";
export const createOrder = async (req, res) => {
    try {
        const { userId, hours, place, time, beverages = [], fruits = [], accessories = [], couponCode } = req.body;
        if (!userId || !hours || !place || !time) {
            return res.status(400).json({ error: 'Missing required fields: userId, hours, place, time' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const beverageIds = beverages.map(b => b.id);
        const fruitIds = fruits.map(f => f.id);
        const accessoryIds = accessories.map(a => a.id);
        const fetchedBeverages = await prisma.beverage.findMany({ where: { id: { in: beverageIds } } });
        const fetchedFruits = await prisma.fruit.findMany({ where: { id: { in: fruitIds } } });
        const fetchedAccessories = await prisma.accessory.findMany({ where: { id: { in: accessoryIds } } });
        const beveragesMap = new Map(fetchedBeverages.map(item => [item.id, item]));
        const fruitsMap = new Map(fetchedFruits.map(item => [item.id, item]));
        const accessoriesMap = new Map(fetchedAccessories.map(item => [item.id, item]));
        const pricePerHour = 40;
        const coolerPrice = hours * pricePerHour;
        let itemsTotal = 0;
        const orderBeveragesData = [];
        const orderFruitsData = [];
        const orderAccessoriesData = [];
        const processItems = (selectedItems, itemsMap, dataArray) => {
            for (const sel of selectedItems) {
                const item = itemsMap.get(sel.id);
                if (!item) throw new Error(`Item not found: ${sel.id}`);
                if (item.stocks < sel.quantity) throw new Error(`Insufficient stock for item: ${sel.id}`);
                const itemPrice = item.price * sel.quantity;
                itemsTotal += itemPrice;
                dataArray.push({
                    itemId: sel.id,
                    quantity: sel.quantity,
                    price: item.price,
                    quantityEn: item.quantityEn,
                    quantityAr: item.quantityAr,
                });
            }
        };
        processItems(beverages, beveragesMap, orderBeveragesData);
        processItems(fruits, fruitsMap, orderFruitsData);
        processItems(accessories, accessoriesMap, orderAccessoriesData);
        let total = coolerPrice + itemsTotal;
        let couponId = null;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
            if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
            if (coupon.expiry < new Date()) return res.status(400).json({ error: 'Coupon expired' });
            if (coupon.minAmount && total < coupon.minAmount) return res.status(400).json({ error: 'Order total below minimum for coupon' });
            if (coupon.type === 'percentage') {
                total -= total * (coupon.value / 100);
            } else if (coupon.type === 'fixed') {
                total -= coupon.value;
            }
            couponId = coupon.id;
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaysOrdersCount = await prisma.order.count({
            where: { createdAt: { gte: todayStart } },
        });
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const orderNumber = `#${todayStr}${(todaysOrdersCount + 1).toString().padStart(4, '0')}`;
        const transactionId = `#TX${todayStr}${(todaysOrdersCount + 1).toString().padStart(4, '0')}`;
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: userId,
                hours,
                place,
                total,
                status: 'PENDING',
                couponId,
            }
        });
        await prisma.payment.create({
            data: {
                transactionId,
                userId,
                orderId: order.id,
                titleEn: 'Cooler Rental Payment',
                titleAr: 'دفع تأجير المبرد',
                descriptionEn: `${hours} Hours Cooler Rental - ${place}`,
                descriptionAr: `${hours} ساعات تأجير مبرد - ${place}`,
                amount: -total,
                categoryEn: 'Cooler Rental',
                categoryAr: 'تأجير المبرد',
                type: 'debit',
                status: 'Completed',
            },
        });
        for (const ob of orderBeveragesData) {
            await prisma.orderBeverage.create({
                data: { orderId: order.id, beverageId: ob.itemId, quantity: ob.quantity, price: ob.price, quantityEn: ob.quantityEn, quantityAr: ob.quantityAr },
            });
            await prisma.beverage.update({
                where: { id: ob.itemId },
                data: { stocks: { decrement: ob.quantity } },
            });
        }
        for (const ofr of orderFruitsData) {
            await prisma.orderFruit.create({
                data: { orderId: order.id, fruitId: ofr.itemId, quantity: ofr.quantity, price: ofr.price, quantityEn: ofr.quantityEn, quantityAr: ofr.quantityAr },
            });
            await prisma.fruit.update({
                where: { id: ofr.itemId },
                data: { stocks: { decrement: ofr.quantity } },
            });
        }
        for (const oa of orderAccessoriesData) {
            await prisma.orderAccessory.create({
                data: { orderId: order.id, accessoryId: oa.itemId, quantity: oa.quantity, price: oa.price, quantityEn: oa.quantityEn, quantityAr: oa.quantityAr },
            });
            await prisma.accessory.update({
                where: { id: oa.itemId },
                data: { stocks: { decrement: oa.quantity } },
            });
        }
        res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(userId) },
            include: {
                orderBeverages: { include: { beverage: true } },
                orderFruits: { include: { fruit: true } },
                orderAccessories: { include: { accessory: true } },
                coupon: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const transformedOrders = orders.map(order => {
            const beverages = order.orderBeverages.map(ob => ({
                nameEn: ob.beverage.nameEn,
                nameAr: ob.beverage.nameAr,
                price: ob.price * ob.quantity,
            }));
            const fruits = order.orderFruits.map(of => ({
                nameEn: of.fruit.nameEn,
                nameAr: of.fruit.nameAr,
                price: of.price * of.quantity,
            }));
            const accessories = order.orderAccessories.map(oa => ({
                nameEn: oa.accessory.nameEn,
                nameAr: oa.accessory.nameAr,
                price: oa.price * oa.quantity,
            }));
            return {
                id: order.orderNumber,
                cooler: {
                    type: `${order.hours} Hours`,
                    price: order.hours * 40,
                },
                beverages,
                fruits,
                accessories,
                location: order.place,
                total: order.total,
                status: order.status,
                date: order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                coupon: order.coupon ? order.coupon.code : null,
            };
        });
        res.json(transformedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// REFUND ORDER
export const refundOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.body;
        const order = await prisma.order.findUnique({
            where: { orderNumber: orderId },
            include: { orderBeverages: true, orderFruits: true, orderAccessories: true },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
        if (order.status === 'CANCELLED') return res.status(400).json({ error: 'Order already cancelled' });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaysPaymentsCount = await prisma.payment.count({
            where: { createdAt: { gte: todayStart } },
        });
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const transactionId = `#TX${todayStr}${(todaysPaymentsCount + 1).toString().padStart(4, '0')}`;
        await prisma.$transaction([
            prisma.order.update({
                where: { orderNumber: orderId },
                data: { status: 'CANCELLED' },
            }),
            prisma.payment.create({
                data: {
                    transactionId,
                    userId,
                    orderId: order.id,
                    titleEn: 'Refund Processed',
                    titleAr: 'تمت معالجة الاسترداد',
                    descriptionEn: `Cancelled order refund - ${order.orderNumber}`,
                    descriptionAr: `استرداد الطلب الملغي - ${order.orderNumber}`,
                    amount: order.total,
                    categoryEn: 'Refund',
                    categoryAr: 'استرداد',
                    type: 'credit',
                    status: 'Completed',
                },
            }),
            ...order.orderBeverages.map(ob =>
                prisma.beverage.update({
                    where: { id: ob.beverageId },
                    data: { stocks: { increment: ob.quantity } },
                })
            ),
            ...order.orderFruits.map(of =>
                prisma.fruit.update({
                    where: { id: of.fruitId },
                    data: { stocks: { increment: of.quantity } },
                })
            ),
            ...order.orderAccessories.map(oa =>
                prisma.accessory.update({
                    where: { id: oa.accessoryId },
                    data: { stocks: { increment: oa.quantity } },
                })
            ),
        ]);
        res.json({ message: 'Order cancelled and refund processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GET PAYMENT HISTORY
export const getPaymentHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const payments = await prisma.payment.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
        });
        const transformedPayments = payments.map(payment => ({
            id: payment.transactionId,
            titleEn: payment.titleEn,
            titleAr: payment.titleAr,
            descriptionEn: payment.descriptionEn,
            descriptionAr: payment.descriptionAr,
            amount: payment.amount,
            date: payment.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: payment.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            categoryEn: payment.categoryEn,
            categoryAr: payment.categoryAr,
            status: payment.status,
            type: payment.type,
        }));
        res.json(transformedPayments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};