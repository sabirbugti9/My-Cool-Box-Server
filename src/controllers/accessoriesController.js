import { prisma } from "../server.js";
export const addAccessories = async (req, res) => {
    try {
        const accessory = await prisma.accessory.create({
            data: req.body
        });
        res.json(accessory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getAccessories = async (req, res) => {
    try {
        const accessories = await prisma.accessory.findMany();
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const updateAccessoriesStock = async (req, res) => {
    try {
        const { decrement } = req.body;
        const accessory = await prisma.accessory.update({
            where: { id: parseInt(req.params.id) },
            data: { stocks: { decrement: parseInt(decrement) } }
        });
        res.json(accessory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteAccessoriesById = async (req, res) => {
    try {
        await prisma.accessory.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Accessory deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}