// 全局错误兜底中间件
import { Request, Response, NextFunction } from 'express';
import { ExternalApiError } from '../external/error';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ExternalApiError) {
    const { status, response } = err;
    return res.status(status ?? 502).json({ message: '第三方接口异常', detail: response });
  }
  res.status(500).json({ message: 'Internal Server Error' });
}