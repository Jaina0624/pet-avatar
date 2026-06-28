// 应用入口
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { petRouter } from './routes/pets';
import { orderRouter } from './routes/orders';
import { pointsRouter } from './routes/points';
import { uploadRouter } from './routes/upload';
import { patternRouter } from './routes/pattern';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, data: { status: 'ok', timestamp: Date.now() } });
});

// 路由
app.use('/api/auth', authRouter);
app.use('/api/pets', authMiddleware, petRouter);
app.use('/api/orders', authMiddleware, orderRouter);
app.use('/api/points', authMiddleware, pointsRouter);
app.use('/api/upload', authMiddleware, uploadRouter);
app.use('/api/pattern', authMiddleware, patternRouter);

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 PetAvatar API 服务已启动: http://localhost:${PORT}`);
});

export default app;
