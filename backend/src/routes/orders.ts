// 订单路由
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuid } from 'uuid';
import { draftPattern } from '../services/patternService';

const router = Router();

// 获取用户订单列表
router.get('/', async (req: AuthRequest, res: Response) => {
  // TODO: 从数据库查询
  res.json({ code: 0, data: [] });
});

// 获取订单详情
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // TODO: 从数据库查询
  res.json({ code: 0, data: { id } });
});

// 创建订单
router.post('/', async (req: AuthRequest, res: Response) => {
  const {
    pet_profile_id, style_id, fabric_id,
    options, total_price, remark
  } = req.body;

  if (!pet_profile_id || !style_id) {
    throw new AppError('缺少必要参数');
  }

  const orderNo = `PA${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // 计算价格明细
  const basePrice = 89; // TODO: 从款式表获取
  const sizeSurcharge = 0; // TODO: 根据体型档位计算
  const optionsSurcharge = 0; // TODO: 根据选项计算

  const order = {
    id: uuid(),
    order_no: orderNo,
    user_id: req.userId,
    pet_profile_id,
    style_id,
    fabric_id,
    options_json: options || {},
    base_price: basePrice,
    size_surcharge: sizeSurcharge,
    options_surcharge: optionsSurcharge,
    total_price: total_price || (basePrice + sizeSurcharge + optionsSurcharge),
    status: 'pending',
    remark,
    created_at: new Date()
  };

  // TODO: 保存到数据库

  // 异步生成裁剪图纸
  draftPattern(order).catch(console.error);

  res.json({ code: 0, data: order });
});

// 取消订单
router.put('/:id/cancel', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // TODO: 更新订单状态
  res.json({ code: 0, msg: '已取消' });
});

export { router as orderRouter };
