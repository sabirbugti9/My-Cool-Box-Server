import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/users.js';
import beverageRoutes from './routes/beverages.js';
import fruitRoutes from './routes/fruits.js';
import accessoriesRoutes from './routes/accessories.js';
import ordersRoutes from './routes/orders.js';
import legelDocRoute from './routes/legel_doc.js';
import couponRoute from './routes/coupon.js';




dotenv.config();

const app = express();
const server = http.createServer(app);
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);







app.use('/api/users', userRoutes);
app.use('/api/products', beverageRoutes);
app.use('/api/products', accessoriesRoutes);
app.use('/api/products', fruitRoutes);
app.use('/api', ordersRoutes);
app.use('/', legelDocRoute);
app.use('/api', couponRoute);




app.post("/api/dummy", async (req, res) => {
  try {
    // wipe existing
    await prisma.beverage.deleteMany({});
    await prisma.fruit.deleteMany({});
    await prisma.accessory.deleteMany({});

    // seed arrays
    const beverageData = [
      {
        nameEn: "Cola",
        nameAr: "كوكاكولا",
        image: "https://freepngimg.com/download/cocacola/19-coca-cola-can-png-image.png",
        price: 1.99,
        quantityEn: "1 Bottle",
        quantityAr: "١ زجاجة",
        stocks: 100
      },
      {
        nameEn: "Lemonade",
        nameAr: "ليمونادة",
        image: "https://static.vecteezy.com/system/resources/previews/050/480/255/non_2x/refreshing-lemonade-served-with-fresh-lemon-slices-cut-out-stock-png.png",
        price: 2.49,
        quantityEn: "1 Glass",
        quantityAr: "١ كأس",
        stocks: 75
      },
      {
        nameEn: "Iced Tea",
        nameAr: "شاي مثلج",
        image: "https://png.pngtree.com/png-clipart/20241114/original/pngtree-a-glass-of-iced-tea-with-green-leaf-on-transparent-background-png-image_17030416.png",
        price: 1.75,
        quantityEn: "1 Cup",
        quantityAr: "١ كوب",
        stocks: 60
      }
    ];

    const fruitData = [
      {
        nameEn: "Apple",
        nameAr: "تفاح",
        image: "https://png.pngtree.com/png-vector/20231017/ourmid/pngtree-fresh-apple-fruit-red-png-image_10203073.png",
        price: 0.99,
        quantityEn: "1 Kg",
        quantityAr: "١ كغ",
        stocks: 200
      },
      {
        nameEn: "Banana",
        nameAr: "موز",
        image: "https://png.pngtree.com/png-clipart/20220716/ourmid/pngtree-banana-yellow-fruit-banana-skewers-png-image_5944324.png",
        price: 0.59,
        quantityEn: "1 Set",
        quantityAr: "١ مجموعة",
        stocks: 150
      },
      {
        nameEn: "Orange",
        nameAr: "برتقال",
        image: "https://cdn.pixabay.com/photo/2016/02/23/17/42/orange-1218158_1280.png",
        price: 0.79,
        quantityEn: "1 Orange",
        quantityAr: "١ برتقالة",
        stocks: 120
      }
    ];

    const accessoryData = [
      {
        nameEn: "Bottle Opener",
        nameAr: "فتاحة زجاجات",
        image: "https://pngimg.com/d/bottle_opener_PNG7.png",
        price: 4.99,
        quantityEn: "1 Opener",
        quantityAr: "١ فتاحة",
        stocks: 50
      },
      {
        nameEn: "Coaster Set",
        nameAr: "طقم كوسترات",
        image: "https://static.vecteezy.com/system/resources/thumbnails/059/598/906/small/stack-of-red-round-coasters-wood-grain-texture-simple-isolated-cut-out-transparent-png.png",
        price: 12.99,
        quantityEn: "1 Set",
        quantityAr: "١ مجموعة",
        stocks: 30
      },
      {
        nameEn: "Straws",
        nameAr: "شفاطات",
        image: "https://static.vecteezy.com/system/resources/thumbnails/024/984/062/small_2x/plastic-straws-waste-plastic-reduction-concept-for-the-planet-3d-illustration-png.png",
        price: 2.99,
        quantityEn: "1 Straw",
        quantityAr: "١ شفاطة",
        stocks: 40
      }
    ];

    // create and return created rows so the response includes fields (including image)
    const beverages = await Promise.all(beverageData.map(d => prisma.beverage.create({ data: d })));
    const fruits = await Promise.all(fruitData.map(d => prisma.fruit.create({ data: d })));
    const accessories = await Promise.all(accessoryData.map(d => prisma.accessory.create({ data: d })));

    res.json({
      message: "Dummy data created successfully",
      beverages,
      fruits,
      accessories
    });
  } catch (error) {
    console.error("dummy route error:", error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.get('/', (req, res) => {
  res.json({
    message: 'My CoolBox',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments',
      votes: '/api/votes',
      reports: '/api/reports',
      conversations: '/api/conversations',
      messages: '/api/messages',
      admin: '/api/admin'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO running on: http://localhost:${PORT}`);
});

export default app;


