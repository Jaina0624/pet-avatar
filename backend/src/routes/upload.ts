// 上传路由
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuid } from 'uuid';
import { config } from '../config';

const router = Router();

// 获取上传签名
router.get('/sign', async (req: AuthRequest, res: Response) => {
  const key = `uploads/${req.userId}/${uuid()}.jpg`;
  const uploadUrl = `https://${config.cos.bucket}.cos.${config.cos.region}.myqcloud.com/${key}`;

  // TODO: 生成腾讯云COS临时签名

  res.json({
    code: 0,
    data: { uploadUrl, key }
  });
});

export { router as uploadRouter };
