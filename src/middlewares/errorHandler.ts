// 全局错误兜底中间件
import { Request, Response, NextFunction } from 'express';
import { ExternalApiError } from '../external/error.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ExternalApiError) {
    // const { status, response } = err;
    res.status(502).json({ code: 502, message: '服务器内部错误：第三方接口请求异常'});
    return
  }
  res.status(500).json({ message: 'Internal Server Error' });
}