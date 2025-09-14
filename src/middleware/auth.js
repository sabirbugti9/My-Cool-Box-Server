import jwt from 'jsonwebtoken';
import {prisma } from "../server.js";



export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, }
        });

        if (!user || user.banned) {
            return res.status(401).json({ error: 'Invalid token or banned account.' });
        }


        req.userId = user.id;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
