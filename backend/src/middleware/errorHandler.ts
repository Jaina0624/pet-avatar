// 错误处理中间件
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Server Error:', err);

  // Zod验证错误
  if (err.name === 'ZodError') {
    return res.status(400).json({
      code: 400,
      msg: '参数验证失败',
      errors: err.errors
    });
  }

  // 自定义业务错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      msg: err.message
    });
  }

  // 默认500
  res.status(500).json({
    code: 500,
    msg: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
}

// 业务错误类
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
