import {prisma } from "../server.js";
export const addBeverge = async (req, res) => {
    try {
        const beverages = await prisma.beverage.findMany();
        res.json(beverages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getBeverages = async (req, res) => {
    try {
        const beverages = await prisma.beverage.findMany();
        res.json(beverages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const updateBeverageStock = async (req, res) => {
    try {
        const { decrement } = req.body;
        const beverage = await prisma.beverage.update({
            where: { id: parseInt(req.params.id) },
            data: { stocks: { decrement } }
        });
        res.json(beverage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteBeverageById = async (req, res) => {
    try {
        await prisma.beverage.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Beverage deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}