import {prisma } from "../server.js";
export const addFruits = async (req, res) => {
    try {
        const fruit = await prisma.fruit.create({
            data: req.body
        });
        res.json(fruit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}
export const getFruits = async (req, res) => {
    try {
        const fruits = await prisma.fruit.findMany();
        res.json(fruits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const updateFruitsStock = async (req, res) => {
    try {
        const { decrement } = req.body;
        const fruit = await prisma.fruit.update({
            where: { id: parseInt(req.params.id) },
            data: { stocks: { decrement: parseInt(decrement) } }
        });
        res.json(fruit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteFruitsById = async (req, res) => {
    try {
        await prisma.fruit.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Fruit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}