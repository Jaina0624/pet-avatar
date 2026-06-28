// 版型制图路由
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generatePattern } from '../services/patternService';

const router = Router();

// 获取款式列表
router.get('/styles', async (req: AuthRequest, res: Response) => {
  const styles = [
    { id: 1, name: '经典背心款', basePrice: 89, description: '百搭基础款' },
    { id: 2, name: '甜美连体衣', basePrice: 129, description: '可爱连体设计' },
    { id: 3, name: '运动四脚套', basePrice: 159, description: '四腿独立套筒' },
    { id: 4, name: '轻量雨衣款', basePrice: 139, description: '防水面料' }
  ];
  res.json({ code: 0, data: styles });
});

// 获取布料列表
router.get('/fabrics', async (req: AuthRequest, res: Response) => {
  const { category } = req.query;
  // TODO: 从数据库筛选
  res.json({ code: 0, data: [] });
});

// 生成裁剪图纸
router.post('/draft', async (req: AuthRequest, res: Response) => {
  const { measurements, styleId } = req.body;

  if (!measurements || !styleId) {
    return res.status(400).json({ code: 400, msg: '缺少参数' });
  }

  const svgString = await generatePattern(measurements, styleId);

  res.json({
    code: 0,
    data: { svg: svgString }
  });
});

export { router as patternRouter };
