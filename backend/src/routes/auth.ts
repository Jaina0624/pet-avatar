// 认证路由
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// 微信登录
router.post('/login', async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError('缺少登录凭证code');
  }

  // 调用微信接口获取openid
  const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: config.wx.appId,
      secret: config.wx.secret,
      js_code: code,
      grant_type: 'authorization_code'
    }
  });

  const { openid, unionid, errcode, errmsg } = wxRes.data;

  if (errcode) {
    throw new AppError(`微信登录失败: ${errmsg}`, 500);
  }

  // 查找或创建用户
  // 实际使用时需连接数据库
  let user = {
    id: `user_${openid.slice(-8)}`,
    openid,
    unionid,
    nickName: '宠物主人',
    avatarUrl: ''
  };

  // 生成JWT
  const token = jwt.sign(
    { userId: user.id, openid: user.openid },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.json({
    code: 0,
    data: { token, userInfo: user }
  });
});

// 获取用户信息
router.get('/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError('未登录', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.secret) as any;

  // 实际从数据库查询
  const user = {
    id: decoded.userId,
    openid: decoded.openid,
    nickName: '宠物主人',
    avatarUrl: ''
  };

  res.json({ code: 0, data: user });
});

export { router as authRouter };
