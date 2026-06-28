// 配置管理
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  wx: {
    appId: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || ''
  },
  cos: {
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || 'ap-guangzhou'
  },
  tripo: {
    apiKey: process.env.TRIPO_API_KEY || '',
    apiUrl: process.env.TRIPO_API_URL || 'https://api.tripo3d.ai'
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/petavatar'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
};
