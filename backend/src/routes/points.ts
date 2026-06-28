// 积分路由
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// 签到规则：基础10分，连续签到额外奖励
const CHECKIN_BASE = 10;
const CHECKIN_STREAK_BONUS = [0, 0, 5, 5, 10, 10, 15]; // 连续天数对应额外积分

// 获取积分概览
router.get('/summary', async (req: AuthRequest, res: Response) => {
  // TODO: 从数据库查询
  res.json({
    code: 0,
    data: {
      balance: 0,
      total_earned: 0,
      streak: 0,
      today_checked: false,
      checkin_days: [],
      transactions: []
    }
  });
});

// 获取积分余额
router.get('/balance', async (req: AuthRequest, res: Response) => {
  // TODO: 从数据库查询
  res.json({ code: 0, data: { balance: 0 } });
});

// 获取今日签到状态
router.get('/checkin-status', async (req: AuthRequest, res: Response) => {
  // TODO: 检查今日是否已签到
  res.json({ code: 0, data: { checkedIn: false } });
});

// 每日签到
router.post('/checkin', async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().slice(0, 10);
  
  // TODO: 检查今日是否已签到（数据库）
  // TODO: 计算连续签到天数
  const streak = 1;
  const bonusIndex = Math.min(streak - 1, CHECKIN_STREAK_BONUS.length - 1);
  const points = CHECKIN_BASE + CHECKIN_STREAK_BONUS[bonusIndex];

  // TODO: 保存签到记录，更新积分账户

  res.json({
    code: 0,
    data: { points, streak }
  });
});

// 积分兑换
router.post('/exchange', async (req: AuthRequest, res: Response) => {
  const { item_id, points } = req.body;

  if (!item_id || !points) {
    throw new AppError('缺少兑换参数');
  }

  // TODO: 检查积分余额是否足够
  // TODO: 扣减积分，记录流水

  res.json({ code: 0, msg: '兑换成功' });
});

export { router as pointsRouter };
