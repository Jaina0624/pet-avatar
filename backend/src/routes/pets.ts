// 宠物档案路由
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuid } from 'uuid';
import { generate3DModel } from '../services/threeDService';

const router = Router();

// 获取用户所有宠物
router.get('/', async (req: AuthRequest, res: Response) => {
  // TODO: 从数据库查询
  const pets = [];
  res.json({ code: 0, data: pets });
});

// 获取最近宠物
router.get('/latest', async (req: AuthRequest, res: Response) => {
  // TODO: 从数据库查询最近创建的宠物
  res.json({ code: 0, data: null });
});

// 获取单个宠物
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // TODO: 从数据库查询
  res.json({ code: 0, data: { id } });
});

// 创建宠物档案
router.post('/', async (req: AuthRequest, res: Response) => {
  const {
    name, species, breed, gender, age,
    neck_cm, chest_cm, back_length_cm, waist_cm,
    size_tier, photos
  } = req.body;

  if (!name || !species || !breed || !neck_cm || !chest_cm || !back_length_cm) {
    throw new AppError('请填写所有必填项');
  }

  const pet = {
    id: uuid(),
    user_id: req.userId,
    name, species, breed, gender, age,
    neck_cm, chest_cm, back_length_cm, waist_cm,
    size_tier, photos: photos || [],
    model_status: 'pending',
    created_at: new Date()
  };

  // TODO: 保存到数据库

  res.json({ code: 0, data: pet });
});

// 更新宠物档案
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // TODO: 更新数据库
  res.json({ code: 0, data: { id } });
});

// 请求生成3D模型
router.post('/:id/generate-3d', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: 从数据库获取宠物信息
  const pet = { id, photos: [], species: 'dog', breed: '金毛' };

  // 异步触发3D生成
  generate3DModel(pet).catch(console.error);

  res.json({ code: 0, msg: '3D模型生成已启动' });
});

export { router as petRouter };
