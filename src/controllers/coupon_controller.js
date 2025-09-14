import { prisma } from "../server.js";




export const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minAmount, expiry } = req.body;
        if (!code || !type || !value || !expiry) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const coupon = await prisma.coupon.create({
            data: {
                code,
                type,
                value,
                minAmount,
                expiry: new Date(expiry),
            },
        });
        res.status(201).json(coupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
};

// Get All Coupons (Admin or User)
export const getCoupons = async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            where: { expiry: { gt: new Date() } }, // Only active coupons
        });
        res.json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

// Update Coupon (Admin)
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, type, value, minAmount, expiry } = req.body;
        const coupon = await prisma.coupon.update({
            where: { id: parseInt(id) },
            data: {
                code,
                type,
                value,
                minAmount,
                expiry: new Date(expiry),
            },
        });
        res.json(coupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
};

// Delete Coupon (Admin)
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.coupon.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
};

export const addDummyCoupons = async (req, res) => {
    try {
        // Optional: Add admin authentication check
        // if (!req.user || !req.user.isAdmin) {
        //   return res.status(403).json({ error: 'Admin access required' });
        // }

        const dummyCoupons = [
            {
                code: 'TEST20',
                type: 'percentage',
                value: 20,
                minAmount: 50,
                expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
            {
                code: 'FREESHIP',
                type: 'fixed',
                value: 15,
                minAmount: 30,
                expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            },
            {
                code: 'WELCOME10',
                type: 'percentage',
                value: 10,
                minAmount: 25,
                expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            },
            {
                code: 'SAVE50',
                type: 'fixed',
                value: 50,
                minAmount: 100,
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        ];

        const createdCoupons = await prisma.$transaction(
            dummyCoupons.map(coupon =>
                prisma.coupon.upsert({
                    where: { code: coupon.code },
                    update: {}, // Skip update if exists
                    create: {
                        code: coupon.code,
                        type: coupon.type,
                        value: coupon.value,
                        minAmount: coupon.minAmount,
                        expiry: coupon.expiry,
                    },
                })
            )
        );

        res.status(201).json({
            message: 'Dummy coupons added successfully',
            coupons: createdCoupons,
        });
    } catch (error) {
        console.error('Error adding dummy coupons:', error);
        res.status(500).json({ error: 'Failed to add dummy coupons' });
    }
};